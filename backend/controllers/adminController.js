const prisma = require('../config/db');
const { sendCompanyApproval } = require('../config/emailService');

// ── Dashboard stats ─────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers        = await prisma.user.count();
    const totalStudents     = await prisma.user.count({ where: { role: 'student' } });
    const totalCompanies    = await prisma.user.count({ where: { role: 'company' } });
    const totalJobs         = await prisma.job.count();
    const approvedJobs      = await prisma.job.count({ where: { isApproved: true } });
    const pendingJobs       = await prisma.job.count({ where: { isApproved: false } });
    const totalApplications = await prisma.application.count();
    const hiredCount        = await prisma.application.count({ where: { status: 'hired' } });
    const pendingCompanies  = await prisma.companyProfile.count({ where: { isApproved: false } });

    // Applications per day for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentApplications = await prisma.application.findMany({
      where:   { createdAt: { gte: sevenDaysAgo } },
      select:  { createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({
      stats: {
        totalUsers,
        totalStudents,
        totalCompanies,
        totalJobs,
        approvedJobs,
        pendingJobs,
        totalApplications,
        hiredCount,
        pendingCompanies,
        recentApplications: recentApplications.length
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Get pending companies ───────────────────────────────
const getPendingCompanies = async (req, res) => {
  try {
    const companies = await prisma.companyProfile.findMany({
      where:   { isApproved: false },
      include: {
        user: { select: { name: true, email: true, createdAt: true } }
      }
    });

    res.status(200).json({ count: companies.length, companies });

  } catch (error) {
    console.error('Pending companies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Approve company ─────────────────────────────────────
const approveCompany = async (req, res) => {
  try {
    const company = await prisma.companyProfile.update({
      where:   { id: parseInt(req.params.id) },
      data:    { isApproved: true },
      include: { user: { select: { name: true, email: true } } }
    });

    // Send approval email
    await sendCompanyApproval(
      company.user.email,
      company.companyName
    );

    res.status(200).json({
      message: 'Company approved successfully',
      company
    });

  } catch (error) {
    console.error('Approve company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Reject company ──────────────────────────────────────
const rejectCompany = async (req, res) => {
  try {
    const company = await prisma.companyProfile.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    await prisma.companyProfile.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.status(200).json({ message: 'Company rejected and removed' });

  } catch (error) {
    console.error('Reject company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Get pending jobs ────────────────────────────────────
const getPendingJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where:   { isApproved: false },
      include: {
        company: { select: { companyName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ count: jobs.length, jobs });

  } catch (error) {
    console.error('Pending jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Approve job ─────────────────────────────────────────
const approveJob = async (req, res) => {
  try {
    const job = await prisma.job.update({
      where: { id: parseInt(req.params.id) },
      data:  { isApproved: true }
    });

    res.status(200).json({ message: 'Job approved successfully', job });

  } catch (error) {
    console.error('Approve job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Reject job ──────────────────────────────────────────
const rejectJob = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await prisma.job.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.status(200).json({ message: 'Job rejected and removed' });

  } catch (error) {
    console.error('Reject job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Get all users ───────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id:        true,
        name:      true,
        email:     true,
        role:      true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ count: users.length, users });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
const getAnalytics = async (req, res) => {
  try {
    const { from, to } = req.query;

    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate   = to   ? new Date(to)   : new Date();

    // Applications per day for last 30 days
    const applications = await prisma.application.findMany({
      where:   { createdAt: { gte: fromDate, lte: toDate } },
      select:  { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' }
    });

    // Jobs per week for last 8 weeks
    const jobs = await prisma.job.findMany({
      where:   { createdAt: { gte: new Date(Date.now() - 56 * 24 * 60 * 60 * 1000) } },
      select:  { createdAt: true, jobType: true, isApproved: true },
      orderBy: { createdAt: 'asc' }
    });

    // Group applications by date
    const appsByDate = {};
    applications.forEach(app => {
      const date = app.createdAt.toISOString().split('T')[0];
      appsByDate[date] = (appsByDate[date] || 0) + 1;
    });

    const appChartData = Object.entries(appsByDate).map(([date, count]) => ({
      date: date.slice(5), count
    })).slice(-14);

    // Group jobs by week
    const jobsByWeek = {};
    jobs.forEach(job => {
      const d    = new Date(job.createdAt);
      const week = `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString('default', { month: 'short' })}`;
      jobsByWeek[week] = (jobsByWeek[week] || 0) + 1;
    });

    const jobChartData = Object.entries(jobsByWeek).map(([week, count]) => ({ week, count }));

    // Job type distribution
    const typeCount = { internship: 0, 'part-time': 0, 'full-time': 0 };
    jobs.forEach(j => { if (typeCount[j.jobType] !== undefined) typeCount[j.jobType]++; });
    const typeChartData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));

    // Status distribution
    const statusCount = { pending: 0, shortlisted: 0, hired: 0, rejected: 0 };
    applications.forEach(a => { if (statusCount[a.status] !== undefined) statusCount[a.status]++; });
    const statusChartData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

    // Recent registrations
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take:    5,
      select:  { id: true, name: true, email: true, role: true, createdAt: true }
    });

    res.json({
      appChartData,
      jobChartData,
      typeChartData,
      statusChartData,
      recentUsers,
      summary: {
        totalApplications: applications.length,
        totalJobs:         jobs.length,
        hiredCount:        applications.filter(a => a.status === 'hired').length,
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const banUser = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data:  { isBanned: true }
    });
    res.json({ message: `${user.name} has been banned` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Delete related records first
    await prisma.notification.deleteMany({ where: { userId } });
    await prisma.application.deleteMany({ where: { userId } });
    await prisma.studentProfile.deleteMany({ where: { userId } });
    await prisma.companyProfile.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getPendingCompanies,
  approveCompany,
  rejectCompany,
  getPendingJobs,
  approveJob,
  rejectJob,
  getAllUsers,
  getAnalytics,
  banUser,
  deleteUser,
};