const eventService = require('../services/eventService');

// POST /api/events
const createEvent = async (req, res) => {
    try {
        const { title, description, category, location, date, capacity } = req.body;

        if (!title || !description || !category || !location || !date || !capacity) {
            return res.status(400).json({ message: 'All required fields must be filled' });
        }

        // If an image was uploaded, store its path
        const eventData = { ...req.body };
        if (req.file) {
            eventData.image = `/uploads/events/${req.file.filename}`;
        }

        // Tags come as a comma-separated string in form-data, convert to array
        if (typeof eventData.tags === 'string') {
            eventData.tags = eventData.tags.split(',').map(t => t.trim());
        }

        const event = await eventService.createEvent(req.user._id, eventData);
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PUT /api/events/:id
const updateEvent = async (req, res) => {
    try {
        const updates = { ...req.body };

        if (req.file) {
            updates.image = `/uploads/events/${req.file.filename}`;
        }

        if (typeof updates.tags === 'string') {
            updates.tags = updates.tags.split(',').map(t => t.trim());
        }

        const event = await eventService.updateEvent(
            req.params.id,
            req.user._id,
            req.user.role,
            updates
        );
        res.status(200).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET /api/events
const getAllEvents = async (req, res) => {
    try {
        const events = await eventService.getAllEvents(req.query);
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
    try {
        const event = await eventService.getEventById(req.params.id);
        res.status(200).json(event);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};


// DELETE /api/events/:id
const deleteEvent = async (req, res) => {
    try {
        const result = await eventService.deleteEvent(
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
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
};