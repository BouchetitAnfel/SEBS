const Event = require('../models/Event');

// Create a new event
const createEvent = async (organizerId, eventData) => {
    const event = await Event.create({
        ...eventData,
        organizer: organizerId, // attach the logged-in user as organizer
    });
    return event;
};

// Get all events (with optional filters)
const getAllEvents = async (queryParams) => {
    const { category, status, search, approved } = queryParams;

    const filter = {};

    // By default, only show approved events to the public
    // Admins/organizers can override this
    if (approved !== 'all') {
        filter.isApproved = true;
    }

    if (category) filter.category = category;
    if (status) filter.status = status;

    // Simple search by title (case-insensitive)
    if (search) {
        filter.title = { $regex: search, $options: 'i' };
    }

    const events = await Event.find(filter)
        .populate('organizer', 'name email') // include organizer name & email
        .sort({ date: 1 }); // soonest first

    return events;
};

// Get a single event by ID
const getEventById = async (eventId) => {
    const event = await Event.findById(eventId).populate('organizer', 'name email');
    if (!event) {
        throw new Error('Event not found');
    }
    return event;
};

// Update an event
const updateEvent = async (eventId, userId, userRole, updates) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw new Error('Event not found');
    }

    if (event.organizer.toString() !== userId.toString() && userRole !== 'admin') {
        throw new Error('Not authorized to update this event');
    }

    if (userRole !== 'admin') {
        delete updates.isApproved;
    }

    Object.assign(event, updates);
    await event.save();

    return event;
};

const deleteEvent = async (eventId, userId, userRole) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw new Error('Event not found');
    }

    if (event.organizer.toString() !== userId.toString() && userRole !== 'admin') {
        throw new Error('Not authorized to delete this event');
    }

    await event.deleteOne();
    return { message: 'Event deleted successfully' };
};
// Get all events created by a specific organizer
const getMyEvents = async (organizerId) => {
    return await Event.find({ organizer: organizerId })
        .sort({ createdAt: -1 });
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getMyEvents,
};