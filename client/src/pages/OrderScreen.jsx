// client/src/pages/OrderScreen.jsx

import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth/AuthContext';
import { FaMapMarkerAlt, FaCreditCard, FaListUl, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

// Helper function for currency formatting
const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
};

const OrderScreen = () => {
    // Get the order ID from the URL parameter (e.g., /order/60d5ec49c69d800015b63013)
    const { id: orderId } = useParams();
    const navigate = useNavigate();
    
    // Auth context to get the user token for authentication
    const { userInfo } = useContext(AuthContext);

    // State for fetching the order
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Order Details from API
    useEffect(() => {
        if (!userInfo) {
            // User must be logged in
            navigate('/login');
            return;
        }

        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/orders/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    setOrder(data);
                } else {
                    setError(data.message || 'Order not found.');
                }
            } catch (err) {
                console.error(err);
                setError('Network error: Could not fetch order details.');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [userInfo, orderId, navigate]);


    // --- Render Logic ---
    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <FaSpinner className="animate-spin text-4xl text-indigo-600" />
                <p className="ml-4 text-lg">Loading Order Details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-6 bg-red-100 text-red-700 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center p-6 bg-gray-100 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
                <p>The requested order could not be retrieved.</p>
            </div>
        );
    }

    // If order is successfully loaded, display details
    return (
        <div className="py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Order <span className="text-indigo-600">{order._id}</span></h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Column 1 & 2: Order Details */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Shipping Address */}
                    <div className="p-6 bg-white border rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-4 border-b pb-2">
                            <FaMapMarkerAlt className='mr-3 text-indigo-600' /> Shipping
                        </h2>
                        <p className="text-gray-700 font-medium">
                            Name: {order.user.name} | Email: {order.user.email}
                        </p>
                        <p className="text-gray-700 mt-2">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                        <p className="text-gray-500">{order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>

                        <div className={`mt-4 p-3 rounded-md font-medium flex items-center ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {order.isDelivered ? (
                                <>
                                    <FaCheckCircle className='mr-2' /> Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                                </>
                            ) : (
                                <>
                                    <FaTimesCircle className='mr-2' /> Not Delivered
                                </>
                            )}
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="p-6 bg-white border rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-4 border-b pb-2">
                            <FaCreditCard className='mr-3 text-indigo-600' /> Payment
                        </h2>
                        <p className="text-gray-700 font-medium mb-4">Method: <span className='font-bold text-indigo-700'>{order.paymentMethod}</span></p>
                        
                        <div className={`p-3 rounded-md font-medium flex items-center ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {order.isPaid ? (
                                <>
                                    <FaCheckCircle className='mr-2' /> Paid on {new Date(order.paidAt).toLocaleDateString()}
                                </>
                            ) : (
                                <>
                                    <FaTimesCircle className='mr-2' /> Not Paid
                                </>
                            )}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6 bg-white border rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-4 border-b pb-2">
                            <FaListUl className='mr-3 text-indigo-600' /> Items
                        </h2>
                        
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="flex items-center justify-between border-b last:border-b-0 pb-2">
                                    <div className="flex items-center">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded mr-4" />
                                        <span className="text-indigo-600 font-medium">
                                            {item.name}
                                        </span>
                                    </div>
                                    <div className="text-gray-700 text-right">
                                        {item.qty} x ₹{addDecimals(item.price)} = <span className='font-semibold'>₹{addDecimals(item.qty * item.price)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 3: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="p-6 bg-white border rounded-lg shadow-xl sticky top-4">
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Order Summary</h2>
                        
                        <div className="space-y-3 text-gray-700">
                            <p className="flex justify-between">
                                <span>Items Price:</span>
                                <span>₹{addDecimals(order.itemsPrice)}</span>
                            </p>
                            <p className="flex justify-between">
                                <span>Shipping:</span>
                                <span>₹{addDecimals(order.shippingPrice)}</span>
                            </p>
                            <p className="flex justify-between border-b pb-3">
                                <span>Tax:</span>
                                <span>₹{addDecimals(order.taxPrice)}</span>
                            </p>
                        </div>

                        <div className="mt-4 pt-4 flex justify-between font-bold text-2xl text-gray-900">
                            <span>Total Paid:</span>
                            <span>₹{addDecimals(order.totalPrice)}</span>
                        </div>
                        
                        {/* Example Payment Button (Placeholder for PayPal/Razorpay integration) */}
                        {!order.isPaid && (
                             <button
                                className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-150"
                            >
                                Pay Now ({order.paymentMethod})
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderScreen;