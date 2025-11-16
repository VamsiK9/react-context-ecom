// server/routes/orderRoutes.js (CommonJS Syntax)

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { addOrderItems, getOrderById, getMyOrders } = require('../controllers/orderController');

const router = express.Router();

// Route for creating a new order (POST)
router.route('/').post(protect, addOrderItems);

// Route for getting all orders for the authenticated user (GET)
// MUST come before the dynamic /:id route
router.route('/myorders').get(protect, getMyOrders);

// Route for getting a single order by ID (GET)
router.route('/:id').get(protect, getOrderById);

module.exports = router;