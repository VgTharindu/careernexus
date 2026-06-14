const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const prisma = require("./config/db");

prisma
  .$connect()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("Database connection error:", err));

  const { startCronJobs } = require('./config/cronJobs');
startCronJobs();

const app = express();
const cors = require("cors");
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://careernexus-vg.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
const path = require('path');
app.use('/uploads', require('express').static(path.join(__dirname, 'uploads')));

app.get("/test-cloudinary", async (req, res) => {
  const { cloudinary } = require("./config/cloudinary");
  try {
    const result = await cloudinary.api.ping();
    res.json({ message: "Cloudinary connected", result });
  } catch (error) {
    res.json({ message: "Cloudinary failed", error: error.message });
  }
});

// ── Routes ──────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const profileRoutes = require("./routes/profileRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const companyRoutes = require('./routes/companyRoutes');
app.use('/api/company', companyRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// ── Health check ────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Campus Job Board API is running!" });
});

// ── Start server ────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const studentRoutes = require("./routes/studentRoutes");
app.use("/api/student", studentRoutes);
