const express = require('express');
const router  = express.Router();
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getCompanyJobs
} = require('../controllers/jobController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

// ── Public routes ─────────────────────────────────────────
router.get('/', getAllJobs);

// ── Company specific — MUST be before /:id ───────────────
router.get('/company/mine', protect, allowRoles('company'), getCompanyJobs);

// ── Single job by ID — comes AFTER /company/mine ─────────
router.get('/:id', getJobById);

// ── Company CRUD ──────────────────────────────────────────
router.post('/',    protect, allowRoles('company'), createJob);
router.put('/:id',  protect, allowRoles('company'), updateJob);
router.delete('/:id', protect, allowRoles('company'), deleteJob);

module.exports = router;