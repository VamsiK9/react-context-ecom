const express = require('express');
const router = express.Router();

// Import all product controller functions
const { getProducts, getProductById, createProduct } = require('../controllers/productController');

// Import your necessary middleware
// NOTE: Make sure the paths to these files are correct for your project
const { protect } = require('../middleware/authMiddleware'); 
const { admin } = require('../middleware/adminMiddleware'); 

// @route   GET /api/products
// @access  Public
router.route('/').get(getProducts);

// @route   POST /api/products (NEW ROUTE)
// @access  Private/Admin
// Requires: 1. Authentication (protect) 2. Admin role (admin)
router.route('/').post(protect, admin, createProduct);

// @route   GET /api/products/:id
// @access  Public
router.route('/:id').get(getProductById);

module.exports = router;