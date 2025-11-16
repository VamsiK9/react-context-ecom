// server/server.js (CommonJS Syntax)

const express = require('express');
const dotenv = require('dotenv');
// We need the 'path' module to correctly resolve the path to the root .env file
const path = require('path'); 
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes'); 
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// --- FIX: Load .env from the project root directory ---
// Use path.resolve to go up one directory (..) from the server folder
dotenv.config({ path: path.resolve(__dirname, '..', '.env') }); 

// Connect to MongoDB
connectDB();

const app = express();

// Body parser middleware (allows us to accept JSON data in the body)
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// --- API Routes ---
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes); // Connects the new Order Routes

// --- Error Handling Middleware ---
// 1. Not Found (404) Handler for any unhandled routes
app.use(notFound);
// 2. Global Error Handler
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    // process.env.NODE_ENV should now correctly show "development"
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`) 
);