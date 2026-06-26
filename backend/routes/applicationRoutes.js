const express    = require('express');
const router     = express.Router();
const path       = require('path');
const multer     = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');

// ── Cloudinary storage for CVs ───────────────────────────
const cvStorage = new CloudinaryStorage({
  cloudinary:  cloudinary,
  params: {
    folder:        'careernexus/cvs',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
  },
});

const cvUpload = multer({
  storage: cvStorage,
  limits:  { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ── Routes ───────────────────────────────────────────────
// Student applies for a job
router.post(
  '/apply/:jobId',
  protect,
  allowRoles('student'),
  cvUpload.single('cv'),
  applyForJob
);

// Student gets their own applications
router.get(
  '/my-applications',
  protect,
  allowRoles('student'),
  getMyApplications
);

// Company gets applications for a specific job
router.get(
  '/job/:jobId',
  protect,
  allowRoles('company'),
  getJobApplications
);

// Company updates application status
router.patch(
  '/:id/status',
  protect,
  allowRoles('company'),
  updateApplicationStatus
);

module.exports = router;