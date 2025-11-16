// client/src/components/Header.jsx

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/auth/AuthContext';
import { CartWishlistContext } from '../context/cartWishlist/CartWishlistContext';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaHeart } from 'react-icons/fa';

const Header = () => {
    const { userInfo, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartWishlistContext);

    const logoutHandler = () => {
        logout();
    };
    
    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    return (
        <header className="bg-gray-800 text-white shadow-lg">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold tracking-wider hover:text-indigo-400 transition duration-150">
                    E-Com Context
                </Link>

                <nav className="flex items-center space-x-6">
                    {/* Cart Icon */}
                    <Link to="/cart" className="flex items-center hover:text-indigo-400 transition duration-150">
                        <FaShoppingCart className="mr-1" /> Cart
                        {cartCount > 0 && (
                            <span className="ml-1 bg-red-600 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Wishlist Icon */}
                    <Link to="/wishlist" className="flex items-center hover:text-indigo-400 transition duration-150">
                        <FaHeart className="mr-1" /> Wishlist
                    </Link>

                    {userInfo ? (
                        <div className="relative group">
                            <button className="flex items-center text-sm font-medium px-3 py-2 rounded hover:bg-gray-700 transition duration-150">
                                <FaUser className="mr-1" /> {userInfo.name}
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-1 z-20 opacity-0 group-hover:opacity-100 transition duration-150 invisible group-hover:visible">
                                <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">
                                    Profile
                                </Link>
                                <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-100">
                                    My Orders
                                </Link>
                                <button
                                    onClick={logoutHandler}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    <FaSignOutAlt className="mr-2" /> Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="flex items-center hover:text-indigo-400 transition duration-150">
                            <FaUser className="mr-1" /> Sign In
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;