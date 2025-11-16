// client/src/pages/CartScreen.jsx

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartWishlistContext } from '../context/cartWishlist/CartWishlistContext';
import { FaShoppingCart, FaTrash, FaSadTear } from 'react-icons/fa';

const CartScreen = () => {
    const { cartItems, removeFromCart } = useContext(CartWishlistContext);
    
    // Calculate totals
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    // Placeholder for other costs (we will calculate these properly later during checkout)
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = itemsPrice * 0.15;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Handler to change quantity (Basic version)
    const qtyChangeHandler = (id, qty) => {
        // In a real app, you'd dispatch an update action here.
        // For simplicity in this demo, we assume the user can only change quantity 
        // on the ProductScreen, but let's add a placeholder log:
        console.log(`Update product ${id} quantity to ${qty}`);
        // To properly update, you would need to implement an 'UPDATE_CART_QTY' action in the reducer
    };

    const checkoutHandler = () => {
        // Redirect to login if not authenticated, otherwise go to shipping
        // Since Auth is already handled at the root, we'll assume logged in for now.
        // navigate('/login?redirect=/shipping'); 
        console.log('Proceed to Shipping Screen');
    };

    return (
        <div className="py-8">
            <h1 className="text-4xl font-bold mb-8 flex items-center">
                <FaShoppingCart className="mr-3 text-indigo-600" /> Shopping Cart
            </h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Cart Items */}
                <div className="lg:w-8/12">
                    {cartItems.length === 0 ? (
                        <div className="p-10 text-center bg-gray-50 border rounded-lg">
                            <FaSadTear className="text-5xl text-gray-400 mx-auto mb-4" />
                            <p className="text-xl text-gray-600">Your cart is empty.</p>
                            <Link to="/" className="text-indigo-600 hover:text-indigo-800 mt-2 block font-medium">Go Back to Shopping</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.product} className="flex items-center p-4 bg-white border rounded-lg shadow-sm">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
                                    
                                    <div className="flex-grow">
                                        <Link to={`/product/${item.product}`} className="font-semibold text-lg hover:text-indigo-600">{item.name}</Link>
                                        <p className="text-gray-500">₹{item.price.toFixed(2)}</p>
                                    </div>
                                    
                                    <select
                                        value={item.qty}
                                        onChange={(e) => qtyChangeHandler(item.product, Number(e.target.value))}
                                        className="mx-4 p-2 border rounded"
                                    >
                                        {[...Array(item.countInStock).keys()].map((x) => (
                                            <option key={x + 1} value={x + 1}>
                                                {x + 1}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={() => removeFromCart(item.product)}
                                        className="text-red-600 hover:text-red-800 p-2 ml-4"
                                    >
                                        <FaTrash size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Totals Summary */}
                <div className="lg:w-4/12">
                    <div className="p-6 bg-white border rounded-lg shadow-xl sticky top-4">
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Order Summary</h2>
                        
                        <div className="space-y-2 text-gray-700">
                            <p className="flex justify-between">
                                <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items):</span>
                                <span>₹{itemsPrice.toFixed(2)}</span>
                            </p>
                            <p className="flex justify-between">
                                <span>Shipping:</span>
                                <span>₹{shippingPrice.toFixed(2)}</span>
                            </p>
                            <p className="flex justify-between">
                                <span>Tax (15%):</span>
                                <span>₹{taxPrice.toFixed(2)}</span>
                            </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-300 flex justify-between font-bold text-xl text-gray-900">
                            <span>Total:</span>
                            <span>₹{totalPrice.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={checkoutHandler}
                            disabled={cartItems.length === 0}
                            className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 transition duration-150"
                        >
                            Proceed To Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartScreen;