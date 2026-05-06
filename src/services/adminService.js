const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// ===== STATISTICS =====
const getStatistics = async () => {
    // Run all counts in parallel for speed
    const [
        totalUsers,
        totalOrganizers,
        bannedUsers,
        totalEvents,
        pendingEvents,
        approvedEvents,
        totalBookings,
        activeBookings,
        cancelledBookings,
        totalReviews,
    ] = await Promise.all([
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ role: 'organizer' }),
        User.countDocuments({ isBanned: true }),
        Event.countDocuments(),
        Event.countDocuments({ isApproved: false }),
        Event.countDocuments({ isApproved: true }),
        Booking.countDocuments(),
        Booking.countDocuments({ status: 'confirmed' }),
        Booking.countDocuments({ status: 'cancelled' }),
        Review.countDocuments(),
    ]);

    // Calculate total revenue from confirmed bookings
    const revenueResult = await Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'attended'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    return {
        users: {
            total: totalUsers + totalOrganizers,
            regularUsers: totalUsers,
            organizers: totalOrganizers,
            banned: bannedUsers,
        },
        events: {
            total: totalEvents,
            approved: approvedEvents,
            pending: pendingEvents,
        },
        bookings: {
            total: totalBookings,
            active: activeBookings,
            cancelled: cancelledBookings,
        },
        reviews: {
            total: totalReviews,
        },
        revenue: {
            total: totalRevenue,
        },
    };
};

// ===== USER MANAGEMENT =====

// Get all users (with optional filters)
const getAllUsers = async (queryParams) => {
    const { role, isBanned, search } = queryParams;
    const filter = {};

    if (role) filter.role = role;
    if (isBanned !== undefined) filter.isBanned = isBanned === 'true';
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }

    return await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 });
};

// Ban or unban a user
const toggleBanUser = async (userId, isBanned) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.role === 'admin') {
        throw new Error('Cannot ban an admin user');
    }

    user.isBanned = isBanned;
    await user.save();

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBanned: user.isBanned,
    };
};

// Change user role (e.g., promote to organizer)
const changeUserRole = async (userId, newRole) => {
    const validRoles = ['user', 'organizer', 'admin'];
    if (!validRoles.includes(newRole)) {
        throw new Error(`Role must be one of: ${validRoles.join(', ')}`);
    }

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.role = newRole;
    await user.save();

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
};

// ===== EVENT MANAGEMENT =====

// Get events pending approval
const getPendingEvents = async () => {
    return await Event.find({ isApproved: false })
        .populate('organizer', 'name email')
        .sort({ createdAt: -1 });
};

// Approve or reject an event
const approveEvent = async (eventId, isApproved) => {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Event not found');

    event.isApproved = isApproved;
    await event.save();

    return event;
};

module.exports = {
    getStatistics,
    getAllUsers,
    toggleBanUser,
    changeUserRole,
    getPendingEvents,
    approveEvent,
};