// server/routes/userRoutes.js (CommonJS Syntax)

const express = require('express');
const {
    authUser,
    getUserProfile,
    registerUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/users -> Register User
// GET /api/users/profile -> Get user profile (Protected)
router.route('/')
    .post(registerUser);

// POST /api/users/login -> Auth user (Login)
router.post('/login', authUser);

// GET /api/users/profile -> Get user profile (Protected)
router.route('/profile')
    .get(protect, getUserProfile);


module.exports = router;