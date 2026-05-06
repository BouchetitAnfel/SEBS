const userService = require('../services/userService');

// POST /api/users/register
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Basic input validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const user = await userService.registerUser({ name, email, password, role });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// POST /api/users/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await userService.loginUser({ email, password });
        res.status(200).json(user);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};
// GET /api/users/profile
const getProfile = async (req, res) => {
    try {
        // req.user is attached by the protect middleware
        const user = await userService.getUserProfile(req.user._id);
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const updatedUser = await userService.updateUserProfile(req.user._id, req.body);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
};