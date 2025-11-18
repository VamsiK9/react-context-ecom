// server/controllers/userController.js (CommonJS Syntax - Fixed 'generateToken' declaration)

const asyncHandler = require('express-async-handler');
const User = require('../models/UserModel');
// We rely solely on this import from the utils folder:
const generateToken = require('../utils/generateToken'); 

// The duplicate placeholder function has been removed from here.

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, isHost } = req.body;

    // Debug: log incoming registration payload
    console.log('REGISTER: incoming body ->', JSON.stringify(req.body));

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400); // Bad Request
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        // If the client sent the isHost flag, treat it as isAdmin on the server
        isAdmin: Boolean(isHost),
    });

    // Debug: log the created user (exclude password)
    try {
        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        };
        console.log('REGISTER: created user ->', JSON.stringify(safeUser));
    } catch (e) {
        console.warn('REGISTER: error logging created user', e);
    }

    if (user) {
        // Create JWT and set as httpOnly cookie
        const token = generateToken(user._id);
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
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
        const token = generateToken(user._id);
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(401); // Unauthorized
        throw new Error('Invalid email or password');
    }
});

// @desc    Logout user (clear cookie)
// @route   POST /api/users/logout
// @access  Public (clears cookie)
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.json({ message: 'Logged out' });
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

// ----------------- New endpoints for cart/wishlist/checkout persistence -----------------
// Get user's cart items
const getCart = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('cartItems');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json(user.cartItems || []);
});

// Replace user's cart items
const updateCart = asyncHandler(async (req, res) => {
    const { cartItems } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    user.cartItems = Array.isArray(cartItems) ? cartItems : [];
    await user.save();
    res.json(user.cartItems);
});

// Get user's wishlist
const getWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('wishlistItems');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json(user.wishlistItems || []);
});

// Replace user's wishlist
const updateWishlist = asyncHandler(async (req, res) => {
    const { wishlistItems } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    user.wishlistItems = Array.isArray(wishlistItems) ? wishlistItems : [];
    await user.save();
    res.json(user.wishlistItems);
});

// Get checkout (shipping + payment) data
const getCheckout = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('shippingAddress paymentMethod');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json({ shippingAddress: user.shippingAddress || {}, paymentMethod: user.paymentMethod || 'Razorpay' });
});

// Update checkout (shipping + payment) data
const updateCheckout = asyncHandler(async (req, res) => {
    const { shippingAddress, paymentMethod } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    user.shippingAddress = shippingAddress || user.shippingAddress;
    user.paymentMethod = paymentMethod || user.paymentMethod;
    await user.save();
    res.json({ shippingAddress: user.shippingAddress, paymentMethod: user.paymentMethod });
});

// Export new handlers
module.exports = {
    registerUser,
    authUser,
    logoutUser,
    getUserProfile,
    getCart,
    updateCart,
    getWishlist,
    updateWishlist,
    getCheckout,
    updateCheckout,
};