// server/data/users.js

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: '123456', // Will be hashed by the User Model pre-save hook
        isAdmin: true,
    },
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
        isAdmin: false,
    },
];

module.exports = users;