const Booking = require('../models/Booking');
const Event = require('../models/Event');

/**
 * If a confirmed booking's event has already passed, mark it as 'attended'.
 * Returns the updated booking.
 */
const markAsAttendedIfPassed = async (booking) => {
    if (booking.status !== 'confirmed') return booking;

    const event = booking.event._id ? booking.event : await Event.findById(booking.event);
    if (!event) return booking;

    const now = new Date();
    if (new Date(event.date) < now) {
        booking.status = 'attended';
        await booking.save();
    }
    return booking;
};

module.exports = { markAsAttendedIfPassed };