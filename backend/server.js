const express = require('express');
const app     = express();
const cors    = require('cors');
const path    = require('path');

// ── CORS ─────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://careernexus-vg.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parser ───────────────────────────────────────────
app.use(express.json());

// ── Static files ──────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────
const authRoutes         = require('./routes/authRoutes');
const jobRoutes          = require('./routes/jobRoutes');
const applicationRoutes  = require('./routes/applicationRoutes');
const adminRoutes        = require('./routes/adminRoutes');
const companyRoutes      = require('./routes/companyRoutes');
const studentRoutes      = require('./routes/studentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth',          authRoutes);
app.use('/api/jobs',          jobRoutes);
app.use('/api/applications',  applicationRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/company',       companyRoutes);
app.use('/api/student',       studentRoutes);
app.use('/api/notifications', notificationRoutes);

// ── Health check ──────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'CareerNexus API is running!' });
});

// ── Cron jobs ─────────────────────────────────────────────
const { startCronJobs } = require('./config/cronJobs');
startCronJobs();

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});