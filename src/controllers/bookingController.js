const bookingService = require('../services/bookingService');

// POST /api/bookings
const createBooking = async (req, res) => {
    try {
        const { eventId, quantity } = req.body;

        if (!eventId) {
            return res.status(400).json({ message: 'eventId is required' });
        }

        const booking = await bookingService.createBooking(req.user._id, {
            eventId,
            quantity,
        });
        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
    try {
        const booking = await bookingService.cancelBooking(
            req.params.id,
            req.user._id,
            req.user.role
        );
        res.status(200).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET /api/bookings/my
const getMyBookings = async (req, res) => {
    try {
        const bookings = await bookingService.getMyBookings(req.user._id);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/bookings/:id
const getBookingById = async (req, res) => {
    try {
        const booking = await bookingService.getBookingById(
            req.params.id,
            req.user._id,
            req.user.role
        );
        res.status(200).json(booking);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};
const downloadTicket = async (req, res) => {
    try {
        const filepath = await bookingService.getTicketPath(
            req.params.id,
            req.user._id,
            req.user.role
        );

        // Send the file as a download
        res.download(filepath, (err) => {
            if (err) {
                console.error('Ticket download error:', err);
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// GET /api/bookings/organizer/list
const getOrganizerBookings = async (req, res) => {
    try {
        const bookings = await bookingService.getOrganizerBookings(req.user._id);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    createBooking,
    cancelBooking,
    getMyBookings,
    getBookingById,
    downloadTicket,
    getOrganizerBookings,
};