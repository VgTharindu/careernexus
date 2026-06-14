const express = require('express');
const router  = express.Router();
const {
  createJob, getAllJobs, getJobById,
  updateJob, deleteJob, getCompanyJobs
} = require('../controllers/jobController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

// Public routes
router.get('/',    getAllJobs);
router.get('/:id', getJobById);

// Company routes
router.post('/',             protect, allowRoles('company'), createJob);
router.get('/company/mine',  protect, allowRoles('company'), getCompanyJobs);
router.put('/:id',           protect, allowRoles('company'), updateJob);
router.delete('/:id',        protect, allowRoles('company'), deleteJob);

module.exports = router;