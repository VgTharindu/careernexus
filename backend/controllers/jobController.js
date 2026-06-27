const prisma = require("../config/db");

// ── Create a job ────────────────────────────────────────
const createJob = async (req, res) => {
  try {
    const { title, description, skills, jobType, stipend, deadline } = req.body;

    // Validation
    if (!title || !description || !jobType || !deadline) {
      return res.status(400).json({
        message: "Please provide title, description, jobType and deadline",
      });
    }

    const validTypes = ["internship", "part-time", "full-time"];
    if (!validTypes.includes(jobType)) {
      return res.status(400).json({
        message: "jobType must be internship, part-time, or full-time",
      });
    }

    // Find the company profile of the logged in user
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!companyProfile) {
      return res.status(404).json({
        message: "Company profile not found. Please create your profile first.",
      });
    }

    if (!companyProfile.isApproved) {
      return res.status(403).json({
        message:
          "Your company account is not approved yet. Please wait for admin approval.",
      });
    }

    // Create the job
    const job = await prisma.job.create({
      data: {
        title,
        description,
        skills,
        jobType,
        stipend,
        deadline: new Date(deadline),
        companyId: companyProfile.id,
        isApproved: false,
      },
    });

    res.status(201).json({
      message: "Job posted successfully. Waiting for admin approval.",
      job,
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ message: "Server error while creating job" });
  }
};

// ── Get all approved jobs ───────────────────────────────
const getAllJobs = async (req, res) => {
  try {
    const { jobType, search, skills, position } = req.query;

    const where = { isApproved: true };

    // Build OR search across title, description, skills
    const orConditions = [];

    if (search) {
      orConditions.push(
        { title:       { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { skills:      { contains: search, mode: 'insensitive' } }
      );
    }

    if (skills) {
      orConditions.push(
        { skills: { contains: skills, mode: 'insensitive' } },
        { title:  { contains: skills, mode: 'insensitive' } }
      );
    }

    if (position) {
      orConditions.push(
        { title:       { contains: position, mode: 'insensitive' } },
        { description: { contains: position, mode: 'insensitive' } }
      );
    }

    if (orConditions.length > 0) {
      where.OR = orConditions;
    }

    if (jobType) {
      where.jobType = jobType;
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        company: {
          select: {
            id:          true,
            companyName: true,
            industry:    true,
            logoUrl:     true,
            website:     true,
            userId:      true,
          }
        },
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ count: jobs.length, jobs });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error while fetching jobs' });
  }
};

// ── Get single job by ID ────────────────────────────────
const getJobById = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        company: {
          select: {
            companyName: true,
            industry: true,
            website: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({ job });
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({ message: "Server error while fetching job" });
  }
};

// ── Update a job ────────────────────────────────────────
const updateJob = async (req, res) => {
  try {
    const { title, description, skills, jobType, stipend, deadline } = req.body;

    // Find the job
    const job = await prisma.job.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { company: true },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Make sure this company owns this job
    if (job.company.userId !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to update this job",
      });
    }

    const updatedJob = await prisma.job.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title: title || job.title,
        description: description || job.description,
        skills: skills || job.skills,
        jobType: jobType || job.jobType,
        stipend: stipend || job.stipend,
        deadline: deadline ? new Date(deadline) : job.deadline,
        isApproved: false,
      },
    });

    res.status(200).json({
      message: "Job updated successfully. Waiting for admin approval again.",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ message: "Server error while updating job" });
  }
};

// ── Delete a job ────────────────────────────────────────
const deleteJob = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { company: true },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Make sure this company owns this job
    if (job.company.userId !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to delete this job",
      });
    }

    await prisma.job.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ message: "Server error while deleting job" });
  }
};

const getCompanyJobs = async (req, res) => {
  try {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!companyProfile) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const jobs = await prisma.job.findMany({
      where:   { companyId: companyProfile.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ count: jobs.length, jobs });
  } catch (error) {
    console.error('Get company jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getCompanyJobs,
};



