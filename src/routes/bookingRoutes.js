const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, bookingController.createBooking);
router.get('/my', protect, bookingController.getMyBookings);
router.get('/:id', protect, bookingController.getBookingById);
router.get('/:id/ticket', protect, bookingController.downloadTicket);   // ← new
router.put('/:id/cancel', protect, bookingController.cancelBooking);

module.exports = router;