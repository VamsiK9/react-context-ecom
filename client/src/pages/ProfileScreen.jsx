// client/src/pages/ProfileScreen.jsx

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/auth/AuthContext';
import { FaUserCircle, FaListAlt, FaSpinner, FaTimesCircle, FaCheckCircle, FaEye } from 'react-icons/fa';

// Helper function to format date
const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : '-';
};

const ProfileScreen = () => {
    const navigate = useNavigate();
    const { userInfo } = useContext(AuthContext);

    // State for orders
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [errorOrders, setErrorOrders] = useState(null);

    // State for profile update (Placeholder)
    const [name, setName] = useState(userInfo?.name || '');
    const [email, setEmail] = useState(userInfo?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);

    // Redirect unauthenticated users
    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
        } else {
            // Populate initial state if userInfo is available
            setName(userInfo.name);
            setEmail(userInfo.email);
            fetchOrders();
        }
    }, [userInfo, navigate]);


    // Fetch Order History
    const fetchOrders = async () => {
        if (!userInfo) return;

        try {
            setLoadingOrders(true);
            setErrorOrders(null);
            
            const response = await fetch('/api/orders/myorders', {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setOrders(data);
            } else {
                setErrorOrders(data.message || 'Failed to fetch orders.');
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setErrorOrders('Network error: Could not fetch order history.');
        } finally {
            setLoadingOrders(false);
        }
    };

    // Placeholder for profile update logic
    const submitHandler = (e) => {
        e.preventDefault();
        setMessage(null);
        
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
        } else {
            // This is where you would normally dispatch an update action to the AuthContext
            console.log('Update Profile submitted:', { name, email, password });
            setMessage('Profile update logic placeholder. Check console.');
            // Clear password fields after submission attempt
            setPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div className="py-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Column 1: Profile Update Form */}
            <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200 sticky top-4">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                        <FaUserCircle className="mr-3 text-indigo-600" /> User Profile
                    </h2>

                    {message && (
                        <div className={`p-3 mb-4 rounded-md text-sm font-medium ${message.includes('match') || message.includes('error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={submitHandler} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" id="name" required value={name} onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter new password (optional)"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                        >
                            Update Profile
                        </button>
                    </form>
                </div>
            </div>

            {/* Column 2 & 3: Order History */}
            <div className="lg:col-span-2">
                <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center border-b pb-2">
                        <FaListAlt className="mr-3 text-indigo-600" /> My Orders
                    </h2>

                    {loadingOrders ? (
                        <div className="flex justify-center items-center h-24">
                            <FaSpinner className="animate-spin text-3xl text-indigo-600" />
                            <p className="ml-4 text-lg">Loading order history...</p>
                        </div>
                    ) : errorOrders ? (
                        <div className="p-3 bg-red-100 text-red-700 rounded text-sm font-medium">
                            Error: {errorOrders}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg text-center font-medium">
                            You have not placed any orders yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PAID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DELIVERED</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition duration-100">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-xs">{order._id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{order.totalPrice}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {order.isPaid ? (
                                                    <FaCheckCircle className="text-green-500 text-xl" />
                                                ) : (
                                                    <FaTimesCircle className="text-red-500 text-xl" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {order.isDelivered ? (
                                                    <FaCheckCircle className="text-green-500 text-xl" />
                                                ) : (
                                                    <FaTimesCircle className="text-red-500 text-xl" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link to={`/order/${order._id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center">
                                                    Details <FaEye className='ml-1' />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileScreen;