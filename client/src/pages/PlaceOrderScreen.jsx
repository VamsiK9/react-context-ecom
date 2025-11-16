// client/src/pages/PlaceOrderScreen.jsx (UPDATED: Added API logic)

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartWishlistContext } from '../context/cartWishlist/CartWishlistContext';
import { AuthContext } from '../context/auth/AuthContext'; // Import AuthContext
import CheckoutSteps from '../components/CheckoutSteps';
import { FaMapMarkerAlt, FaCreditCard, FaListUl, FaExclamationTriangle } from 'react-icons/fa';

// Helper function to format price and apply simple calculations
const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
};

const PlaceOrderScreen = () => {
    const { cartItems, shippingAddress, paymentMethod, clearCart } = useContext(CartWishlistContext);
    const { userInfo } = useContext(AuthContext); // Get user info for token
    const navigate = useNavigate();

    // Local state for API status
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Calculate Prices
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 1000 ? 0 : 50; 
    const taxPrice = itemsPrice * 0.15;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;
    
    // Prepare order details for submission
    const orderDetails = {
        orderItems: cartItems.map(item => ({
            name: item.name,
            qty: item.qty,
            image: item.image,
            price: item.price,
            product: item.product, // product ID
        })),
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        itemsPrice: addDecimals(itemsPrice),
        shippingPrice: addDecimals(shippingPrice),
        taxPrice: addDecimals(taxPrice),
        totalPrice: addDecimals(totalPrice),
    };


    // Redirect guards
    useEffect(() => {
        if (!shippingAddress.address) {
            navigate('/shipping');
        } else if (cartItems.length === 0) {
            navigate('/cart');
        }
        // Redirect if not logged in (though ProtectedRoute should handle this)
        if (!userInfo) {
            navigate('/login');
        }
    }, [shippingAddress, cartItems, navigate, userInfo]);


    // Handle Order Submission (API call)
    const placeOrderHandler = async () => {
        if (!userInfo) {
            setError('You must be logged in to place an order.');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify(orderDetails),
            });

            const data = await response.json();

            if (response.ok) {
                // Success: Clear cart and navigate to the new order page
                clearCart();
                navigate(`/order/${data._id}`); // Redirect to the new order page
            } else {
                // Failure: Handle server-side errors (e.g., validation)
                setError(data.message || 'Failed to place order.');
            }

        } catch (err) {
            console.error(err);
            setError('Network error: Could not connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-8">
            <CheckoutSteps step1 step2 step3 />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Column 1 & 2: Order Details (Shipping, Payment, Items) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Shipping Address */}
                    <div className="p-6 bg-white border rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-4 border-b pb-2">
                            <FaMapMarkerAlt className='mr-3 text-indigo-600' /> Shipping
                        </h2>
                        <p className="text-gray-700 font-medium">{shippingAddress.address}, {shippingAddress.city}</p>
                        <p className="text-gray-500">{shippingAddress.postalCode}, {shippingAddress.country}</p>
                    </div>

                    {/* Payment Method */}
                    <div className="p-6 bg-white border rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-4 border-b pb-2">
                            <FaCreditCard className='mr-3 text-indigo-600' /> Payment Method
                        </h2>
                        <p className="text-gray-700 font-medium">Method: <span className='font-bold text-indigo-700'>{paymentMethod}</span></p>
                    </div>

                    {/* Order Items */}
                    <div className="p-6 bg-white border rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-4 border-b pb-2">
                            <FaListUl className='mr-3 text-indigo-600' /> Order Items
                        </h2>
                        
                        {cartItems.length === 0 ? (
                            <div className="text-red-500 flex items-center">
                                <FaExclamationTriangle className='mr-2' /> Your cart is empty.
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {cartItems.map((item) => (
                                    <div key={item.product} className="flex items-center justify-between border-b last:border-b-0 pb-2">
                                        <div className="flex items-center">
                                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded mr-4" />
                                            <Link to={`/product/${item.product}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
                                                {item.name}
                                            </Link>
                                        </div>
                                        <div className="text-gray-700 text-right">
                                            {item.qty} x ₹{addDecimals(item.price)} = <span className='font-semibold'>₹{addDecimals(item.qty * item.price)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 3: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="p-6 bg-white border rounded-lg shadow-xl sticky top-4">
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Order Summary</h2>
                        
                        <div className="space-y-3 text-gray-700">
                            <p className="flex justify-between">
                                <span>Items Price:</span>
                                <span>₹{addDecimals(itemsPrice)}</span>
                            </p>
                            <p className="flex justify-between">
                                <span>Shipping:</span>
                                <span>₹{addDecimals(shippingPrice)}</span>
                            </p>
                            <p className="flex justify-between border-b pb-3">
                                <span>Tax (15%):</span>
                                <span>₹{addDecimals(taxPrice)}</span>
                            </p>
                        </div>

                        <div className="mt-4 pt-4 flex justify-between font-bold text-2xl text-gray-900">
                            <span>Total Order:</span>
                            <span>₹{addDecimals(totalPrice)}</span>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm font-medium">
                                Error: {error}
                            </div>
                        )}
                        
                        {/* Loading Indicator */}
                        {loading && (
                            <div className="mt-4 flex items-center justify-center p-2 bg-indigo-100 text-indigo-700 rounded text-sm">
                                Placing Order...
                            </div>
                        )}

                        <button
                            onClick={placeOrderHandler}
                            disabled={cartItems.length === 0 || loading}
                            className="mt-6 w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition duration-150"
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderScreen;