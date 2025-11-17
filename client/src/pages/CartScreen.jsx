// client/src/pages/CartScreen.jsx (UPDATED for checkoutHandler fix)

import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaSpinner } from 'react-icons/fa';

import { CartWishlistContext } from '../context/cartWishlist/CartWishlistContext';
import { AuthContext } from '../context/auth/AuthContext'; // Import AuthContext

const CartScreen = () => {
    const navigate = useNavigate();
    const { cartItems, loading, error, removeFromCart, updateCartItemQty } = useContext(CartWishlistContext);
    const { userInfo } = useContext(AuthContext); // Get user info

    // Calculate item count and totals
    const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2);

    // FIX: Ensure navigation correctly handles authentication state
    const checkoutHandler = () => {
        if (userInfo) {
            console.log('User is logged in. Proceeding to shipping screen.');
            navigate('/shipping');
        } else {
            console.log('User not logged in. Redirecting to login.');
            navigate('/login?redirect=/shipping');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <FaSpinner className="animate-spin text-4xl text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg shadow-md">
                Error loading cart: {error}
            </div>
        );
    }

    return (
        <div className="py-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center">
                <FaShoppingCart className="mr-3 text-indigo-600" /> Shopping Cart
            </h1>

            {cartItems.length === 0 ? (
                <div className="p-6 bg-yellow-100 text-yellow-700 rounded-lg text-center shadow-md">
                    Your cart is currently empty. <Link to="/" className="font-semibold underline hover:text-yellow-800">Go shopping!</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Column 1 & 2: Cart Items List */}
                    <div className="lg:col-span-2 space-y-6">
                        {cartItems.map((item) => (
                            <div key={item.product} className="flex items-center bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition duration-200">
                                {/* Image */}
                                <div className="w-20 h-20 flex-shrink-0 mr-4 rounded-md overflow-hidden border">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/80x80/EEEEEE/333333?text=No+Image"; }}
                                    />
                                </div>
                                
                                {/* Product Info */}
                                <div className="flex-grow">
                                    <Link to={`/product/${item.product}`} className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition">
                                        {item.name}
                                    </Link>
                                    <p className="text-xl font-bold text-indigo-600">₹{item.price}</p>
                                </div>

                                {/* Quantity Selector */}
                                <div className="w-24 mx-4">
                                    <select 
                                        className="form-select block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        value={item.qty} 
                                        onChange={(e) => updateCartItemQty(item.product, Number(e.target.value))}
                                    >
                                        {[...Array(item.countInStock).keys()].map((x) => (
                                            <option key={x + 1} value={x + 1}>
                                                {x + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFromCart(item.product)}
                                    className="p-3 ml-4 text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition duration-150"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Column 3: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 sticky top-4">
                            <h2 className="text-2xl font-bold text-gray-900 border-b pb-4 mb-4">
                                Order Summary
                            </h2>
                            <div className="space-y-3">
                                <p className="flex justify-between text-lg font-medium text-gray-700">
                                    <span>Items ({totalItems})</span>
                                    <span>₹{totalPrice}</span>
                                </p>
                                <p className="flex justify-between text-lg font-medium text-gray-700">
                                    <span>Shipping</span>
                                    <span>FREE</span>
                                </p>
                                <div className="border-t pt-4">
                                    <p className="flex justify-between text-2xl font-extrabold text-indigo-700">
                                        <span>Total</span>
                                        <span>₹{totalPrice}</span>
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={checkoutHandler}
                                disabled={cartItems.length === 0}
                                className={`mt-6 w-full py-3 px-4 rounded-lg text-lg font-semibold text-white transition duration-200 ${
                                    cartItems.length === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                }`}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartScreen;
