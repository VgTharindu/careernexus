const express  = require('express');
const router   = express.Router();
const prisma   = require('../config/db');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const bcrypt   = require('bcryptjs');

// ── Local storage for profile images ───────────────────
const imageDir = path.join(__dirname, '..', 'uploads', 'profiles');
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imageDir),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user.id}-${Date.now()}${ext}`);
  }
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG and WebP images are allowed'), false);
  },
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB
});

// ── GET student profile ─────────────────────────────────
router.get('/profile', protect, allowRoles('student'), async (req, res) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where:   { userId: req.user.id },
      include: { user: { select: { name: true, email: true, createdAt: true } } }
    });
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET any student profile by ID (for companies) ───────
router.get('/profile/:userId', protect, async (req, res) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where:   { userId: parseInt(req.params.userId) },
      include: { user: { select: { name: true, email: true } } }
    });
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── UPDATE student profile ──────────────────────────────
router.put('/profile', protect, allowRoles('student'), async (req, res) => {
  try {
    const {
      degree, university, skills,
      bio, linkedin, github, jobPosition
    } = req.body;

    const profile = await prisma.studentProfile.upsert({
      where:  { userId: req.user.id },
      update: { degree, university, skills, bio, linkedin, github, jobPosition },
      create: { userId: req.user.id, degree, university, skills, bio, linkedin, github, jobPosition }
    });

    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── UPLOAD profile image ────────────────────────────────
router.post(
  '/profile/image',
  protect,
  allowRoles('student'),
  imageUpload.single('profileImage'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
      }

      const imageUrl = `/uploads/profiles/${req.file.filename}`;

      await prisma.studentProfile.upsert({
        where:  { userId: req.user.id },
        update: { profileImage: imageUrl },
        create: { userId: req.user.id, profileImage: imageUrl }
      });

      res.json({ message: 'Profile image updated', imageUrl });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ── CHANGE password ─────────────────────────────────────
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt    = await bcrypt.genSalt(10);
    const hashed  = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data:  { password: hashed }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
