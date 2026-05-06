const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, bookingController.createBooking);
router.get('/my', protect, bookingController.getMyBookings);
router.get('/:id', protect, bookingController.getBookingById);
router.get('/:id/ticket', protect, bookingController.downloadTicket);   // ← new
router.put('/:id/cancel', protect, bookingController.cancelBooking);

router.get('/organizer/list', protect, authorize('organizer', 'admin'), bookingController.getOrganizerBookings);
module.exports = router;