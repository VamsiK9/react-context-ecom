// server/models/OrderModel.js (CommonJS Syntax)

const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
    {
        // Link to the user who placed the order
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // References the 'User' model
        },
        // Shipping details
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        // Array of products ordered
        orderItems: [
            {
                name: { type: String, required: true },
                qty: { type: Number, required: true },
                image: { type: String, required: true },
                price: { type: Number, required: true },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Product', // References the 'Product' model
                },
            },
        ],
        // Payment method selected by the user
        paymentMethod: {
            type: String,
            required: true,
        },
        // Pricing Summary
        itemsPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        // Razorpay Order ID saved when creating order in Razorpay
        razorpayOrderId: {
            type: String,
        },
        // Store payment verification/result details
        paymentResult: {
            id: { type: String },
            status: { type: String },
            update_time: { type: Date },
            email_address: { type: String },
        },
        // Payment status details
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        // Delivery status details
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt timestamps
    }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;