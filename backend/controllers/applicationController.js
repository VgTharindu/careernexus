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
    const jobId = parseInt(req.params.jobId);
    const { coverLetter } = req.body;

    const job = await prisma.job.findUnique({
      where:   { id: jobId },
      include: { company: true }
    });

    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: { userId: req.user.id, jobId }
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Cloudinary returns full URL in req.file.path
    const cvUrl = req.file ? req.file.path : null;

    console.log('req.file:', req.file);
    console.log('cvUrl (Cloudinary URL):', cvUrl);

    // ── AI Scoring ──────────────────────────────────────
    let aiScore    = null;
    let aiFeedback = null;

    if (req.file && cvUrl) {
      try {
        console.log('Downloading PDF from Cloudinary for AI scoring...');

        // Fetch the PDF from Cloudinary URL
        const axios = require('axios');
        const response = await axios.get(cvUrl, { responseType: 'arraybuffer' });
        const pdfBuffer = Buffer.from(response.data);

        const pdfData = await pdfParse(pdfBuffer);
        const cvText  = pdfData.text;

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

      } catch (aiError) {
        console.error('AI error:', aiError.message);
      }
    }

    const application = await prisma.application.create({
      data: {
        userId: req.user.id,
        jobId,
        coverLetter,
        cvUrl,
        aiScore,
        aiFeedback,
        status: 'pending',
      }
    });

    // ... rest of email/notification code stays the same

    res.status(201).json({ message: 'Application submitted successfully', application });

  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ message: 'Server error while applying' });
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

const getMyApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where:   { userId: req.user.id },
      include: {
        job: {
          include: {
            company: {
              select: {
                id:          true,
                companyName: true,
                logoUrl:     true,
                industry:    true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parse aiFeedback JSON string for each application
    const parsed = applications.map(app => ({
      ...app,
      aiFeedback: app.aiFeedback
        ? (() => { try { return JSON.parse(app.aiFeedback); } catch { return null; } })()
        : null
    }));

    res.status(200).json({ applications: parsed });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
};