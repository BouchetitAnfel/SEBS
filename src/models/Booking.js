const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Must book at least 1 ticket'],
            default: 1,
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['confirmed', 'cancelled', 'attended'],
            default: 'confirmed',
        },
        bookingReference: {
            type: String,
            unique: true,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);