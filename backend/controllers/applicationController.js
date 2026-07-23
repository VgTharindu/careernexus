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
    const { id }     = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'shortlisted', 'hired', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // ── Fetch application WITH job and company included ──
    const application = await prisma.application.findUnique({
      where:   { id: parseInt(id) },
      include: {
        job: {
          include: {
            company: {
              select: { companyName: true }
            }
          }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // ── Update the status ──────────────────────────────
    const updated = await prisma.application.update({
      where: { id: parseInt(id) },
      data:  { status }
    });

    // ── In-app notification ────────────────────────────
    const companyName = application.job?.company?.companyName || 'the company';
    const jobTitle    = application.job?.title || 'the position';

    const messages = {
      shortlisted: `Congratulations! You have been shortlisted for ${jobTitle} at ${companyName}.`,
      hired:       `Great news! You have been hired for ${jobTitle} at ${companyName}!`,
      rejected:    `Your application for ${jobTitle} at ${companyName} was not successful this time. Keep trying!`,
    };

    if (messages[status]) {
      try {
        await createNotification(
          application.userId,
          messages[status],
          status === 'hired' ? 'success' : status === 'shortlisted' ? 'info' : 'warning'
        );
      } catch (notifErr) {
        console.error('Notification error (non-fatal):', notifErr.message);
      }
    }

    // ── Email notification ─────────────────────────────
    if (application.user?.email && messages[status]) {
      try {
        const nodemailer  = require('nodemailer');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        await transporter.sendMail({
          from:    `"CareerNexus" <${process.env.EMAIL_USER}>`,
          to:      application.user.email,
          subject: `Application Update — ${jobTitle}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <div style="background:linear-gradient(135deg,#001F3F,#003366);padding:24px;border-radius:12px;margin-bottom:20px;text-align:center;">
                <h1 style="color:#00CCCC;margin:0;font-size:24px;">CareerNexus</h1>
                <p style="color:#94A3B8;margin:6px 0 0;font-size:13px;">Smarter Hiring. Better Futures.</p>
              </div>
              <h2 style="color:#1E293B;">Application Status Update</h2>
              <p style="color:#475569;">Hello <strong>${application.user.name}</strong>,</p>
              <p style="color:#475569;">${messages[status]}</p>
              <div style="margin:24px 0;padding:16px;background:#F0F8FF;border-radius:8px;border-left:4px solid #007BFF;">
                <p style="margin:0;color:#1E293B;font-size:14px;">
                  <strong>Position:</strong> ${jobTitle}<br>
                  <strong>Company:</strong> ${companyName}<br>
                  <strong>Status:</strong> <span style="color:${status==='hired'?'#00C853':status==='shortlisted'?'#007BFF':'#FF4444'};font-weight:bold;text-transform:capitalize;">${status}</span>
                </p>
              </div>
              <p style="color:#94A3B8;font-size:12px;">Login to CareerNexus to view your full application history.</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Email error (non-fatal):', emailErr.message);
      }
    }

    res.status(200).json({
      message:     `Application status updated to ${status}`,
      application: updated
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
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