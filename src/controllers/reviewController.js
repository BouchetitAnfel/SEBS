const reviewService = require('../services/reviewService');

// POST /api/reviews
const createReview = async (req, res) => {
    try {
        const { eventId, rating, comment } = req.body;

        if (!eventId || !rating) {
            return res.status(400).json({ message: 'eventId and rating are required' });
        }

        const review = await reviewService.createReview(req.user._id, {
            eventId,
            rating,
            comment,
        });
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET /api/reviews/event/:eventId
const getEventReviews = async (req, res) => {
    try {
        const reviews = await reviewService.getEventReviews(req.params.eventId);
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/reviews/:id
const updateReview = async (req, res) => {
    try {
        const review = await reviewService.updateReview(
            req.params.id,
            req.user._id,
            req.body
        );
        res.status(200).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
    try {
        const result = await reviewService.deleteReview(
            req.params.id,
            req.user._id,
            req.user.role
        );
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createReview,
    getEventReviews,
    updateReview,
    deleteReview,
};