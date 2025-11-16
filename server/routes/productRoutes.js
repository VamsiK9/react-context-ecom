// server/routes/productRoutes.js

const express = require('express');
const router = express.Router();
const { getProducts, getProductById } = require('../controllers/productController');

// GET /api/products
router.route('/').get(getProducts);

// GET /api/products/:id
router.route('/:id').get(getProductById);

module.exports = router;