const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { welcomeTemplate } = require('../utils/emailTemplates');

// Sign up new user
const registerUser = async ({ name, email, password, role }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
    });

    // 📧 Send welcome email (fire-and-forget, doesn't block response)
    const template = welcomeTemplate(user.name);
    sendEmail({ to: user.email, ...template });

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
    };
};

// Login
const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid inputs recheck your password or your email');
    }

    if (user.isBanned) {
        throw new Error('You are banned. You can send an email to request a relook on your account');
    }

    // 🔒 Verify the password matches the hashed one in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid inputs recheck your password or your email');
    }

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
    };
};

// Get user profile by ID
const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

// Update user profile
const updateUserProfile = async (userId, updates) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Only allow updating certain fields (never role or isBanned via this endpoint!)
    if (updates.name) user.name = updates.name;

    // If email is being changed, make sure it's not already in use
    if (updates.email && updates.email !== user.email) {
        const exists = await User.findOne({ email: updates.email });
        if (exists) {
            throw new Error('Email already in use');
        }
        user.email = updates.email;
    }

    // If user wants to change password, hash the new one
    if (updates.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(updates.password, salt);
    }

    await user.save();

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
};