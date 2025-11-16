// server/seeder.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users');
const products = require('./data/products');
const User = require('./models/userModel');
const Product = require('./models/productModel');
const Order = require('./models/orderModel'); // Import Order model for clean up
const connectDB = require('./config/db');

// Load environment variables from the root .env file
dotenv.config({ path: '../.env' }); 

connectDB(); // Connect to the database

const importData = async () => {
    try {
        // 1. Clear existing data
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        // 2. Insert users
        const createdUsers = await User.insertMany(users);

        // 3. Get the admin user (first user)
        const adminUser = createdUsers[0]._id;

        // 4. Map products to include the admin user as the creator
        const sampleProducts = products.map((product) => {
            return { ...product, user: adminUser };
        });

        // 5. Insert products
        await Product.insertMany(sampleProducts);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error with data import: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error with data destroy: ${error.message}`);
        process.exit(1);
    }
};

// Command line argument handling (node seeder -d to destroy)
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}