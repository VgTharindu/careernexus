const express = require('express');
const router  = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.use(protect);
router.use(allowRoles('admin'));

router.get('/stats',                   getDashboardStats);
router.get('/analytics',               getAnalytics);
router.get('/pending-companies',       getPendingCompanies);
router.patch('/companies/:id/approve', approveCompany);
router.patch('/companies/:id/reject',  rejectCompany);
router.get('/pending-jobs',            getPendingJobs);
router.patch('/jobs/:id/approve',      approveJob);
router.patch('/jobs/:id/reject',       rejectJob);
router.get('/users',                   getAllUsers);
router.patch('/users/:id/ban',         banUser);
router.delete('/users/:id',            deleteUser);

module.exports = router;