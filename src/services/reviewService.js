const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { markAsAttendedIfPassed } = require('../utils/updateBookingStatus');

// Helper: recompute average rating and count for an event
const updateEventRating = async (eventId) => {
    const stats = await Review.aggregate([
        { $match: { event: new (require('mongoose').Types.ObjectId)(eventId) } },
        {
            $group: {
                _id: '$event',
                averageRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 },
            },
        },
    ]);

    if (stats.length > 0) {
        await Event.findByIdAndUpdate(eventId, {
            averageRating: Math.round(stats[0].averageRating * 10) / 10, // 1 decimal
            reviewCount: stats[0].reviewCount,
        });
    } else {
        await Event.findByIdAndUpdate(eventId, {
            averageRating: 0,
            reviewCount: 0,
        });
    }
};

// Submit a review
const createReview = async (userId, { eventId, rating, comment }) => {
    // 1. Find the user's booking for this event
    const booking = await Booking.findOne({ user: userId, event: eventId })
        .populate('event');

    if (!booking) {
        throw new Error('You can only review events you have booked');
    }

    // 2. Auto-update if event date has passed
    await markAsAttendedIfPassed(booking);

    // 3. Confirm the user actually attended
    if (booking.status !== 'attended') {
        throw new Error('You can only review events you have attended');
    }

    // 4. Check for existing review
    const existing = await Review.findOne({ user: userId, event: eventId });
    if (existing) {
        throw new Error('You have already reviewed this event');
    }

    // 5. Create the review
    const review = await Review.create({
        user: userId,
        event: eventId,
        rating,
        comment,
    });

    // 6. Update event's aggregate rating
    await updateEventRating(eventId);

    return await Review.findById(review._id).populate('user', 'name');
};

// Get all reviews for an event
const getEventReviews = async (eventId) => {
    return await Review.find({ event: eventId })
        .populate('user', 'name')
        .sort({ createdAt: -1 });
};

// Update own review
const updateReview = async (reviewId, userId, { rating, comment }) => {
    const review = await Review.findById(reviewId);
    if (!review) {
        throw new Error('Review not found');
    }

    if (review.user.toString() !== userId.toString()) {
        throw new Error('Not authorized to update this review');
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();

    await updateEventRating(review.event);

    return review;
};

// Delete a review (owner or admin)
const deleteReview = async (reviewId, userId, userRole) => {
    const review = await Review.findById(reviewId);
    if (!review) {
        throw new Error('Review not found');
    }

    if (review.user.toString() !== userId.toString() && userRole !== 'admin') {
        throw new Error('Not authorized to delete this review');
    }

    const eventId = review.event;
    await review.deleteOne();
    await updateEventRating(eventId);

    return { message: 'Review deleted successfully' };
};

module.exports = {
    createReview,
    getEventReviews,
    updateReview,
    deleteReview,
};