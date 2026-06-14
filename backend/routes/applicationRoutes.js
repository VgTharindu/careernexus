const express  = require('express');
const router   = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Local storage — save file to uploads/ folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `cv-${unique}.pdf`);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('File received by multer:', file.originalname, file.mimetype);
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Student routes
router.post(
  '/apply/:jobId',
  protect,
  allowRoles('student'),
  upload.single('cv'),
  applyForJob
);

router.get(
  '/my-applications',
  protect,
  allowRoles('student'),
  getMyApplications
);

// Company routes
router.get(
  '/job/:jobId',
  protect,
  allowRoles('company'),
  getJobApplications
);

router.patch(
  '/:applicationId/status',
  protect,
  allowRoles('company'),
  updateApplicationStatus
);

module.exports = router;