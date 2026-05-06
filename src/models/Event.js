const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['concert', 'conference', 'workshop', 'sport', 'other'],
        },
        tags: {
            type: [String], // array of strings, e.g. ['music', 'jazz']
            default: [],
        },
        location: {
            type: String,
            default:'',
        },
        date: {
            type: Date,
            default: Date.now(),
        },
        price: {
            type: Number,
            required: true,
            min: [0, 'Price cannot be negative'],
            default: 0,
        },
        capacity: {
            type: Number,
            min: [1, 'Capacity must be at least 1'],
        },
        bookedSeats: {
            type: Number,
            default: 0,
        },
        averageRating: {
            type: Number,
            default: 0,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
        image: {
            type: String, // we'll store the file path here later
            default: '',
        },
        status: {
            type: String,
            enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
            default: 'upcoming',
        },
        isApproved: {
            type: Boolean,
            default: false, // admin needs to approve events
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // links to the User model
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);