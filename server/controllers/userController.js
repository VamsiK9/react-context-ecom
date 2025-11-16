// server/controllers/userController.js (CommonJS Syntax)

const asyncHandler = require('express-async-handler');
const User = require('../models/UserModel');
const generateToken = require('../utils/generateToken'); // Assuming you have this helper

// Placeholder for generateToken, needed until you provide the utils folder
// If you don't have this, the controller will crash.
const generateToken = (id) => {
    const jwt = require('jsonwebtoken');
    // Using a 30-day expiration time
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};


// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400); // Bad Request
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});


// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(401); // Unauthorized
        throw new Error('Invalid email or password');
    }
});


// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (Requires JWT)
const getUserProfile = asyncHandler(async (req, res) => {
    // req.user is populated by the protect middleware
    const user = req.user; 

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    registerUser,
    authUser,
    getUserProfile,
};