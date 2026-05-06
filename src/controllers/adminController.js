const adminService = require('../services/adminService');

// GET /api/admin/stats
const getStats = async (req, res) => {
    try {
        const stats = await adminService.getStatistics();
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const users = await adminService.getAllUsers(req.query);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/users/:id/ban
const banUser = async (req, res) => {
    try {
        const { isBanned } = req.body;

        if (typeof isBanned !== 'boolean') {
            return res.status(400).json({ message: 'isBanned must be true or false' });
        }

        const user = await adminService.toggleBanUser(req.params.id, isBanned);
        res.status(200).json({
            message: isBanned ? 'User banned' : 'User unbanned',
            user,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PUT /api/admin/users/:id/promote
const changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ message: 'role is required' });
        }

        const user = await adminService.changeUserRole(req.params.id, role);
        res.status(200).json({
            message: `User role updated to ${role}`,
            user,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET /api/admin/events/pending
const getPendingEvents = async (req, res) => {
    try {
        const events = await adminService.getPendingEvents();
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/events/:id/approve
const approveEvent = async (req, res) => {
    try {
        const { isApproved } = req.body;

        if (typeof isApproved !== 'boolean') {
            return res.status(400).json({ message: 'isApproved must be true or false' });
        }

        const event = await adminService.approveEvent(req.params.id, isApproved);
        res.status(200).json({
            message: isApproved ? 'Event approved' : 'Event rejected',
            event,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getStats,
    getAllUsers,
    banUser,
    changeUserRole,
    getPendingEvents,
    approveEvent,
};