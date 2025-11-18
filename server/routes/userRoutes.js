// server/routes/userRoutes.js (CommonJS Syntax)

const express = require('express');
const {
    authUser,
    getUserProfile,
    registerUser,
    logoutUser,
    getCart,
    updateCart,
    getWishlist,
    updateWishlist,
    getCheckout,
    updateCheckout,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/users -> Register User
// GET /api/users/profile -> Get user profile (Protected)
router.route('/')
    .post(registerUser);

// Logout endpoint
router.post('/logout', logoutUser);

// POST /api/users/login -> Auth user (Login)
router.post('/login', authUser);

// GET /api/users/profile -> Get user profile (Protected)
router.route('/profile')
    .get(protect, getUserProfile);

// Cart endpoints
router.route('/cart')
    .get(protect, getCart)
    .put(protect, updateCart);

// Wishlist endpoints
router.route('/wishlist')
    .get(protect, getWishlist)
    .put(protect, updateWishlist);

// Checkout (shippingAddress + paymentMethod)
router.route('/checkout')
    .get(protect, getCheckout)
    .put(protect, updateCheckout);


module.exports = router;