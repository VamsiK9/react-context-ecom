// server/middleware/authMiddleware.js (CommonJS Syntax)

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/UserModel');

// Middleware to verify JWT and attach user to request object
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for authorization header and confirm it starts with 'Bearer'
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (it's in the format "Bearer TOKEN")
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find user by ID from the token payload and exclude the password
            // Attach the user object to the request for use in controllers (req.user)
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    // If no Authorization header token, try to read from cookies (httpOnly cookie named 'token')
    if (!token) {
        try {
            const cookie = req.headers.cookie; // raw cookie string
            if (cookie) {
                const match = cookie.split(';').map(c => c.trim()).find(c => c.startsWith('token='));
                if (match) {
                    token = match.split('=')[1];
                }
            }
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = await User.findById(decoded.id).select('-password');
                return next();
            }
        } catch (error) {
            console.error('Cookie auth failed', error);
        }

        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

module.exports = { protect };