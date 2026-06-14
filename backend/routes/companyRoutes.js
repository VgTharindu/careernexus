const express = require('express');
const router  = express.Router();
const prisma  = require('../config/db');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const multer  = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const bcrypt  = require('bcryptjs');

// ── Cloudinary storage for logos ────────────────────────
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'careernexus/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }],
  },
});

// ── Cloudinary storage for company photos ───────────────
const photoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'careernexus/company-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
  },
});

const logoUpload  = multer({ storage: logoStorage,  limits: { fileSize: 3 * 1024 * 1024 } });
const photoUpload = multer({ storage: photoStorage, limits: { fileSize: 3 * 1024 * 1024 } });
// ── GET company profile ─────────────────────────────────
router.get('/profile', protect, allowRoles('company'), async (req, res) => {
  try {
    const profile = await prisma.companyProfile.findUnique({
      where:   { userId: req.user.id },
      include: { user: { select: { name: true, email: true, createdAt: true } } }
    });
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET public company profile (for students) ───────────
router.get('/profile/:id', protect, async (req, res) => {
  try {
    const profile = await prisma.companyProfile.findUnique({
      where:   { id: parseInt(req.params.id) },
      include: { user: { select: { name: true, email: true } } }
    });
    if (!profile) return res.status(404).json({ message: 'Company not found' });
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── UPDATE company profile ──────────────────────────────
router.put('/profile', protect, allowRoles('company'), async (req, res) => {
  try {
    const { companyName, industry, website, description, location, size } = req.body;

    if (!companyName) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    const existing = await prisma.companyProfile.findUnique({
      where: { userId: req.user.id }
    });

    let profile;
    if (existing) {
      profile = await prisma.companyProfile.update({
        where: { userId: req.user.id },
        data:  { companyName, industry, website, description, location, size }
      });
    } else {
      profile = await prisma.companyProfile.create({
        data: { userId: req.user.id, companyName, industry, website, description, location, size }
      });
    }

    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── UPLOAD logo ─────────────────────────────────────────
router.post(
  '/profile/logo',
  protect,
  allowRoles('company'),
  logoUpload.single('logo'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No logo uploaded' });

      const logoUrl = req.file.path; // Cloudinary full URL

      await prisma.companyProfile.upsert({
        where:  { userId: req.user.id },
        update: { logoUrl },
        create: { userId: req.user.id, companyName: req.user.name || 'My Company', logoUrl }
      });

      res.json({ message: 'Logo updated', logoUrl });
    } catch (error) {
      console.error('Logo upload error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ── UPLOAD company photos ───────────────────────────────
router.post(
  '/profile/photos',
  protect,
  allowRoles('company'),
  photoUpload.array('photos', 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No photos uploaded' });
      }

      const existing = await prisma.companyProfile.findUnique({
        where: { userId: req.user.id }
      });

      const existingPhotos = existing?.photos
        ? JSON.parse(existing.photos)
        : [];

      // Cloudinary returns full URLs in req.files[].path
      const newPhotos = req.files.map(f => f.path);
      const allPhotos = [...existingPhotos, ...newPhotos].slice(0, 5);

      await prisma.companyProfile.upsert({
        where:  { userId: req.user.id },
        update: { photos: JSON.stringify(allPhotos) },
        create: { userId: req.user.id, companyName: 'My Company', photos: JSON.stringify(allPhotos) }
      });

      res.json({ message: 'Photos uploaded', photos: allPhotos });
    } catch (error) {
      console.error('Photos upload error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ── DELETE a company photo ──────────────────────────────
router.delete('/profile/photos', protect, allowRoles('company'), async (req, res) => {
  try {
    const { photoUrl } = req.body;

    const existing = await prisma.companyProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!existing) return res.status(404).json({ message: 'Profile not found' });

    const photos    = existing.photos ? JSON.parse(existing.photos) : [];
    const filtered  = photos.filter(p => p !== photoUrl);

    await prisma.companyProfile.update({
      where: { userId: req.user.id },
      data:  { photos: JSON.stringify(filtered) }
    });

    res.json({ message: 'Photo removed', photos: filtered });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── CHANGE password ─────────────────────────────────────
router.put('/change-password', protect, allowRoles('company'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user    = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data:  { password: hashed }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET company stats ───────────────────────────────────
router.get('/stats', protect, allowRoles('company'), async (req, res) => {
  try {
    const profile = await prisma.companyProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) return res.json({ stats: { jobs: 0, applicants: 0, shortlisted: 0, hired: 0 } });

    const jobs        = await prisma.job.findMany({ where: { companyId: profile.id } });
    const jobIds      = jobs.map(j => j.id);

    const applications = await prisma.application.findMany({
      where: { jobId: { in: jobIds } }
    });

    res.json({
      stats: {
        jobs:        jobs.length,
        applicants:  applications.length,
        shortlisted: applications.filter(a => a.status === 'shortlisted').length,
        hired:       applications.filter(a => a.status === 'hired').length,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;