const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { uploadEventImage } = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Protected routes (organizer or admin)
//router.post('/', protect, authorize('organizer', 'admin'), eventController.createEvent);
//router.put('/:id', protect, authorize('organizer', 'admin'), eventController.updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), eventController.deleteEvent);
router.get('/my/list', protect, authorize('organizer', 'admin'), eventController.getMyEvents);
router.post('/', protect, authorize('organizer', 'admin'), uploadEventImage.single('image'), eventController.createEvent);
router.put(
    '/:id',
    protect,
    authorize('organizer', 'admin'),
    uploadEventImage.single('image'),
    eventController.updateEvent);
module.exports = router;