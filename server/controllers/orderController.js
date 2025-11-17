// server/controllers/orderController.js (CommonJS Syntax)

const asyncHandler = require('express-async-handler');
const Order = require('../models/OrderModel');

const Razorpay = require('razorpay'); // Need the library
const crypto = require('crypto'); // Need for cryptographic verification

// Get Razorpay Key IDs from environment variables
// NOTE: Make sure these are defined in your .env file!
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Initialize Razorpay Instance
const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    // 1. Create a new Order document in the database
    let order = new Order({
        user: req.user._id,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    });

    // 2. Conditional Razorpay Order Creation
    if (paymentMethod === 'Razorpay') {
        const amountInPaise = Math.round(totalPrice * 100);

        try {
            // Create the order on the Razorpay side
            const rzpOrder = await razorpayInstance.orders.create({
                amount: amountInPaise, 
                currency: 'INR',
                receipt: `receipt_${order._id}`, // Use your MongoDB ID as a unique receipt
                notes: { 
                    orderId: order._id.toString(), 
                    userId: req.user._id.toString() 
                },
            });

            // Save the Razorpay Order ID to your local MongoDB Order document
            order.razorpayOrderId = rzpOrder.id;

        } catch (razorpayError) {
            console.error('Razorpay API Error:', razorpayError);
            res.status(500);
            throw new Error('Failed to create Razorpay Order. Please check server keys.');
        }
    }

    // 3. Save the order (now possibly updated with razorpayOrderId)
    const createdOrder = await order.save();

    // 4. Send the required Razorpay details back to the client
    let responseData = { ...createdOrder.toObject() };

    if (paymentMethod === 'Razorpay') {
        // Send the Razorpay Order ID and the public Key ID (which is safe to expose)
        responseData.razorpayOrderId = order.razorpayOrderId;
        responseData.razorpayKeyId = RAZORPAY_KEY_ID; 
        responseData.amount = order.totalPrice; // Ensure amount matches
    }

    res.status(201).json(responseData);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    // Find the order by its ID and populate the user field to get name and email
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    // Find all orders where the 'user' field matches the logged-in user's ID
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

// This function receives the successful payment data from the client 
// and verifies it securely on the server.
const updateOrderToPaid = async (req, res) => {
    // 1. Get the Order
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    // 2. Prepare for Verification
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // NOTE: Replace these with your actual environment variables!
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET; 

    // 3. Generate Signature and Compare
    const shasum = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
    shasum.update(`${order.razorpayOrderId}|${razorpay_payment_id}`); // Use the order ID your server created

    const expectedSignature = shasum.digest('hex');

    if (expectedSignature === razorpay_signature) {
        // 4. Verification SUCCESS! Update the Order in DB
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: razorpay_payment_id,
            status: 'SUCCESS',
            update_time: Date.now(),
            email_address: req.user.email, // Assuming protect middleware adds user
        };

        const updatedOrder = await order.save();
        
        // Respond to the client to confirm success
        res.json({ success: true, message: 'Payment verified and order updated.', order: updatedOrder });

    } else {
        // 5. Verification FAILURE!
        res.status(400).json({ success: false, message: 'Payment verification failed: Signature mismatch.' });
    }
};

module.exports = { addOrderItems, getOrderById, getMyOrders, updateOrderToPaid };