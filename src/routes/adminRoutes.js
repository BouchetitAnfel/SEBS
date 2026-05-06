const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Apply both middlewares to ALL admin routes
// "Apply once at the top" pattern — cleaner than repeating on every route
router.use(protect, authorize('admin'));

// Statistics
router.get('/stats', adminController.getStats);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/ban', adminController.banUser);
router.put('/users/:id/promote', adminController.changeUserRole);

// Event management
router.get('/events/pending', adminController.getPendingEvents);
router.put('/events/:id/approve', adminController.approveEvent);

module.exports = router;