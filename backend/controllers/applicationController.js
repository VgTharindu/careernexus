const prisma      = require('../config/db');
const pdfParse = require('pdf-parse');
const fs          = require('fs');
const path        = require('path');
const { scoreCV } = require('../config/aiService');
const {
  sendApplicationConfirmation,
  sendStatusUpdate
} = require('../config/emailService');
const { createNotification } = require('../config/notificationService');

// ── Apply for a job ─────────────────────────────────────
const applyForJob = async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const jobId = parseInt(req.params.jobId);

    console.log('Apply request received');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);

    // Check job exists and is approved
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.isApproved) {
      return res.status(400).json({ message: 'This job is not available' });
    }

    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: { userId: req.user.id, jobId }
    });

    if (existingApplication) {
      return res.status(400).json({
        message: 'You have already applied for this job'
      });
    }

    // Store as clean URL path, not Windows file path
    const cvUrl = req.file? `/uploads/${req.file.filename}`: null;
    console.log('cvUrl:', cvUrl);

    // ── AI Scoring ──────────────────────────────────────
    let aiScore    = null;
    let aiFeedback = null;

    if (req.file && cvUrl) {
      try {
        console.log('Reading PDF file from local storage...');

        // Read file directly from disk
        const absolutePath = require('path').join(__dirname, '..', 'uploads', req.file.filename);
        const pdfBuffer    = fs.readFileSync(absolutePath);
        const pdfData   = await pdfParse(pdfBuffer);
        const cvText    = pdfData.text;

        console.log('CV text length:', cvText.length);
        console.log('Sending to Gemini AI...');

        const aiResult = await scoreCV(
          cvText,
          job.title,
          job.description,
          job.skills
        );

        console.log('Gemini response:', aiResult);

        aiScore    = aiResult.score;
        aiFeedback = JSON.stringify({
          feedback: aiResult.feedback,
          summary:  aiResult.summary
        });

        console.log('AI Score:', aiScore);

      } catch (aiError) {
        console.error('AI error:', aiError.message);
      }
    } else {
      console.log('No file uploaded — skipping AI');
    }

    // Save application to database
    const application = await prisma.application.create({
      data: {
        userId:      req.user.id,
        jobId,
        coverLetter,
        cvUrl,
        status:      'pending',
        aiScore,
        aiFeedback
      }
    });

    // Update student profile
    if (cvUrl) {
      await prisma.studentProfile.upsert({
        where:  { userId: req.user.id },
        update: { cvUrl },
        create: { userId: req.user.id, cvUrl }
      });
    }

    // Send confirmation email to student
    try {
      const student = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { name: true, email: true }
      });

      const jobWithCompany = await prisma.job.findUnique({
        where:   { id: jobId },
        include: { company: { select: { companyName: true } } }
      });

      await sendApplicationConfirmation(
        student.email,
        student.name,
        jobWithCompany.title,
        jobWithCompany.company.companyName
      );
    } catch (emailError) {
      console.error('Confirmation email failed:', emailError.message);
    }

    res.status(201).json({
      message:     'Application submitted successfully',
      application: {
        id:         application.id,
        status:     application.status,
        aiScore:    application.aiScore,
        aiFeedback: application.aiFeedback
          ? JSON.parse(application.aiFeedback)
          : null,
        createdAt:  application.createdAt
      }
    });

  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ message: 'Server error while applying' });
  }
};

// ── Get student's own applications ──────────────────────
const getMyApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where:   { userId: req.user.id },
      include: {
        job: {
          select: {
            title:    true,
            jobType:  true,
            deadline: true,
            company: {
              select: { companyName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      count:        applications.length,
      applications
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Get all applications for a job (company) ────────────
const getJobApplications = async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId);

    const job = await prisma.job.findUnique({
      where:   { id: jobId },
      include: { company: true }
    });

    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.company.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await prisma.application.findMany({
      where:   { jobId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        }
      },
      orderBy: { aiScore: 'desc' }
    });

    // Fetch student profiles for each applicant
    const appsWithProfiles = await Promise.all(
      applications.map(async (app) => {
        const profile = await prisma.studentProfile.findUnique({
          where: { userId: app.user.id }
        });
        return {
          ...app,
          aiFeedback: app.aiFeedback ? JSON.parse(app.aiFeedback) : null,
          studentProfile: profile || null,
        };
      })
    );

    res.status(200).json({
      count:        appsWithProfiles.length,
      applications: appsWithProfiles
    });

  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Update application status (company) ─────────────────
const updateApplicationStatus = async (req, res) => {
  try {
    const { status }    = req.body;
    const applicationId = parseInt(req.params.applicationId);

    const validStatuses = ['pending', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Status must be pending, shortlisted, rejected or hired'
      });
    }

    const application = await prisma.application.findUnique({
      where:   { id: applicationId },
      include: { job: { include: { company: true } } }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.job.company.userId !== req.user.id) {
      return res.status(403).json({
        message: 'Not authorized to update this application'
      });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data:  { status }
    });

    // Send status update email to student
    try {
      const student = await prisma.user.findUnique({
        where:  { id: application.userId },
        select: { name: true, email: true }
      });

      await sendStatusUpdate(
        student.email,
        student.name,
        application.job.title,
        application.job.company.companyName,
        status
      );
    } catch (emailError) {
      console.error('Status email failed:', emailError.message);
    }

    // Create in-app notification
    const messages = {
      shortlisted: `Congratulations! You have been shortlisted for ${application.job.title} at ${application.job.company.companyName}`,
      hired:       `You have been hired for ${application.job.title} at ${application.job.company.companyName}!`,
      rejected:    `Your application for ${application.job.title} at ${application.job.company.companyName} was not successful this time`,
    };

    if (messages[status]) {
      await createNotification(application.userId, messages[status], status === 'hired' ? 'success' : status === 'shortlisted' ? 'info' : 'warning');
    }

    res.status(200).json({
      message:     `Application status updated to ${status}`,
      application: updated
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
};