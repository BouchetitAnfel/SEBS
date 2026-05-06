const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT and attaches the user to the request
const protect = async (req, res, next) => {
    try {
        // 1. Get the token from the Authorization header
        //    Expected format: "Bearer <token>"
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Not authorized, no token provided' });
        }

        const token = authHeader.split(' ')[1];

        // 2. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Find the user (excluding password) and attach to req
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        if (user.isBanned) {
            return res.status(403).json({ message: 'Your account has been banned' });
        }

        req.user = user; // available to all next handlers
        next();          // continue to the controller
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
};

// Restricts access to specific roles
// Usage: authorize('admin') or authorize('admin', 'organizer')
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role '${req.user.role}' is not allowed to access this resource`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize };