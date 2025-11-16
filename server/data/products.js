// server/data/products.js (Use a placeholder image URL for now)

const products = [
    {
        name: 'Logitech G Pro Wireless Mouse',
        image: '/images/mouse.jpg', 
        description: 'Lightweight gaming mouse designed with pros for the highest performance.',
        brand: 'Logitech',
        category: 'Electronics',
        price: 129.99,
        countInStock: 10,
        rating: 4.5,
        numReviews: 12,
    },
    {
        name: 'iPhone 15 Pro Max',
        image: '/images/iphone.jpg',
        description: 'The latest flagship smartphone with A17 Bionic chip.',
        brand: 'Apple',
        category: 'Electronics',
        price: 1099.99,
        countInStock: 7,
        rating: 4.8,
        numReviews: 25,
    },
    {
        name: 'Sony 4K LED TV',
        image: '/images/tv.jpg',
        description: 'Stunning 4K resolution and smart features.',
        brand: 'Sony',
        category: 'Electronics',
        price: 1499.00,
        countInStock: 5,
        rating: 4.2,
        numReviews: 8,
    },
    {
        name: 'Cannon EOS R6 Mirrorless Camera',
        image: '/images/camera.jpg',
        description: 'Full-frame mirrorless camera for professional photographers.',
        brand: 'Cannon',
        category: 'Electronics',
        price: 2499.00,
        countInStock: 0,
        rating: 4.9,
        numReviews: 15,
    },
];

module.exports = products;