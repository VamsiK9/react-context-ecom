const express = require('express');
const router = express.Router();
const { 
    addOrderItems, 
    getOrderById, 
    getMyOrders, 
    updateOrderToPaid // <-- New function imported
} = require('../controllers/orderController');

// Assuming you have an authentication middleware named 'protect'
const { protect } = require('../middleware/authMiddleware'); 

// @desc Create new order (POST /api/orders)
router.route('/').post(protect, addOrderItems);

// @desc Get logged in user orders (GET /api/orders/myorders)
router.route('/myorders').get(protect, getMyOrders);

// @desc Update order to paid (PUT /api/orders/:id/pay)
// This is the missing route for payment verification.
router.route('/:id/pay').put(protect, updateOrderToPaid);

// @desc Get order by ID (GET /api/orders/:id)
router.route('/:id').get(protect, getOrderById);

module.exports = router;