// Assumes you are using express-async-handler for error handling
const admin = (req, res, next) => {
    // 1. Check if the user is authenticated (req.user is set by the 'protect' middleware)
    // 2. Check if the user object has the isAdmin property set to true
    if (req.user && req.user.isAdmin) {
        // User is authenticated and is an admin, proceed to the controller
        next();
    } else {
        // User is not authorized to access this route
        res.status(403); // Forbidden
        throw new Error('Not authorized as an admin');
    }
};

module.exports = { admin };