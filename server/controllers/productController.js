// server/controllers/productController.js

const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({});
    res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 * * NOTE: The 'protect' middleware attaches the authenticated user to req.user.
 * The 'admin' middleware ensures only admins/hosts can reach this route.
 */
const createProduct = asyncHandler(async (req, res) => {
    // Destructure required fields from the request body
    const { 
        name, 
        price, 
        image, 
        brand, 
        category, 
        countInStock, 
        description 
    } = req.body;

    // --- Server-Side Validation ---
    // Mongoose will perform its own validation on save, but explicit checks 
    // provide clearer error messages for the client.
    if (!name || !price || !image || !brand || !category || !description || countInStock === undefined) {
        res.status(400);
        throw new Error('Please ensure all required fields (name, price, image, brand, category, countInStock, description) are provided.');
    }

    // Additional numeric validation
    if (parseFloat(price) <= 0) {
        res.status(400);
        throw new Error('Product price must be greater than zero.');
    }
    if (parseInt(countInStock, 10) < 0) {
        res.status(400);
        throw new Error('Count in stock cannot be negative.');
    }

    // --- Mongoose Save Logic ---
    try {
        const product = await Product.create({
            // The 'user' field is required by the schema and must be set 
            // from the authenticated user provided by the 'protect' middleware.
            user: req.user._id, 
            name, 
            price, 
            image, 
            brand, 
            category, 
            countInStock, 
            description,
            
            // rating, numReviews, and reviews will take their schema defaults (0 and [])
        });
    
        res.status(201).json({ 
            message: 'Product created successfully', 
            product 
        });

    } catch (error) {
        // Handle Mongoose-specific validation errors gracefully
        res.status(400);
        throw new Error(`Invalid data received: ${error.message}`);
    }
});


module.exports = { getProducts, getProductById, createProduct };