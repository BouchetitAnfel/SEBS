const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const generateReference = require('../utils/generateReference');
const generateTicket = require('../utils/generateTicket');
const sendEmail = require('../utils/sendEmail');
const {
    bookingConfirmationTemplate,
    bookingCancellationTemplate,
} = require('../utils/emailTemplates');
const { markAsAttendedIfPassed } = require('../utils/updateBookingStatus');

// Create a booking
const createBooking = async (userId, { eventId, quantity = 1 }) => {
    // 1. Find the event
    const event = await Event.findById(eventId);
    if (!event) {
        throw new Error('Event not found');
    }

    // 2. Block bookings for unapproved or cancelled events
    if (!event.isApproved) {
        throw new Error('This event is not yet approved for bookings');
    }
    if (event.status === 'cancelled' || event.status === 'completed') {
        throw new Error(`Cannot book a ${event.status} event`);
    }

    // 3. Check capacity
    const availableSeats = event.capacity - event.bookedSeats;
    if (quantity > availableSeats) {
        throw new Error(`Only ${availableSeats} seats available`);
    }

    // 4. Prevent the same user from double-booking the same event
    const existing = await Booking.findOne({
        user: userId,
        event: eventId,
        status: 'confirmed',
    });
    if (existing) {
        throw new Error('You already have a booking for this event');
    }

    // 5. Create the booking
    const booking = await Booking.create({
        user: userId,
        event: eventId,
        quantity,
        totalPrice: event.price * quantity,
        bookingReference: generateReference(),
    });

    // 6. Update the event's booked seats count
    event.bookedSeats += quantity;
    await event.save();

    // 7. Get populated booking (so the response shows event/user details)
    const populatedBooking = await Booking.findById(booking._id)
        .populate('event', 'title date location price category')
        .populate('user', 'name email');

    // 8. 📧 Send confirmation email WITH ticket attached
    const userDoc = populatedBooking.user;
    const template = bookingConfirmationTemplate(userDoc.name, populatedBooking, event);

    try {
        const ticketPath = await generateTicket(populatedBooking, event, userDoc);
        sendEmail({
            to: userDoc.email,
            ...template,
            attachments: [
                {
                    filename: `ticket-${populatedBooking.bookingReference}.pdf`,
                    path: ticketPath,
                },
            ],
        });
    } catch (err) {
        console.error('Ticket attachment failed:', err.message);
        // Still send the email even if ticket generation fails
        sendEmail({ to: userDoc.email, ...template });
    }

    return populatedBooking;
};

// Cancel a booking
const cancelBooking = async (bookingId, userId, userRole) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new Error('Booking not found');
    }

    // Only the booking owner or an admin can cancel
    if (booking.user.toString() !== userId.toString() && userRole !== 'admin') {
        throw new Error('Not authorized to cancel this booking');
    }

    if (booking.status === 'cancelled') {
        throw new Error('Booking is already cancelled');
    }

    // Free up seats on the event
    const event = await Event.findById(booking.event);
    if (event) {
        event.bookedSeats = Math.max(0, event.bookedSeats - booking.quantity);
        await event.save();
    }

    booking.status = 'cancelled';
    await booking.save();

    // 📧 Send cancellation email
    const user = await User.findById(booking.user);
    if (user && event) {
        const template = bookingCancellationTemplate(user.name, booking, event);
        sendEmail({ to: user.email, ...template });
    }

    return booking;
};
// Get all bookings for events owned by an organizer
const getOrganizerBookings = async (organizerId) => {
    // First, find all events by this organizer
    const events = await Event.find({ organizer: organizerId }).select('_id');
    const eventIds = events.map(e => e._id);

    // Then, find all bookings for those events
    return await Booking.find({ event: { $in: eventIds } })
        .populate('user', 'name email')
        .populate('event', 'title date')
        .sort({ createdAt: -1 });
};
// Get all bookings of the current user

const getMyBookings = async (userId) => {
    const bookings = await Booking.find({ user: userId })
        .populate('event', 'title date location image price status')
        .sort({ createdAt: -1 });

    // Lazy update: mark past events as 'attended'
    for (const booking of bookings) {
        await markAsAttendedIfPassed(booking);
    }

    return bookings;
};
// Get a single booking (only owner or admin can view)
const getBookingById = async (bookingId, userId, userRole) => {
    const booking = await Booking.findById(bookingId)
        .populate('event')
        .populate('user', 'name email');

    if (!booking) {
        throw new Error('Booking not found');
    }

    if (booking.user._id.toString() !== userId.toString() && userRole !== 'admin') {
        throw new Error('Not authorized to view this booking');
    }

    return booking;
};

// PDF ticket and return its file path
const getTicketPath = async (bookingId, userId, userRole) => {
    const booking = await Booking.findById(bookingId)
        .populate('event')
        .populate('user', 'name email');

    if (!booking) {
        throw new Error('Booking not found');
    }

    if (booking.user._id.toString() !== userId.toString() && userRole !== 'admin') {
        throw new Error('Not authorized to download this ticket');
    }

    if (booking.status === 'cancelled') {
        throw new Error('Cannot download ticket for a cancelled booking');
    }

    const filepath = await generateTicket(booking, booking.event, booking.user);
    return filepath;
};

module.exports = {
    createBooking,
    cancelBooking,
    getMyBookings,
    getBookingById,
    getTicketPath,
    getOrganizerBookings,
};