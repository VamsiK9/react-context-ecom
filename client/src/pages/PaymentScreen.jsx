// client/src/pages/PaymentScreen.jsx

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartWishlistContext } from '../context/cartWishlist/CartWishlistContext';
import CheckoutSteps from '../components/CheckoutSteps';

const PaymentScreen = () => {
    const { shippingAddress, paymentMethod, savePaymentMethod } = useContext(CartWishlistContext);
    const navigate = useNavigate();

    // Check if shipping address exists before proceeding
    useEffect(() => {
        if (!shippingAddress.address) {
            navigate('/shipping');
        }
    }, [shippingAddress, navigate]);
    
    // Initialize state with stored payment method
    const [selectedMethod, setSelectedMethod] = useState(paymentMethod);

    const submitHandler = (e) => {
        e.preventDefault();
        savePaymentMethod(selectedMethod);
        navigate('/placeorder'); // Move to the next step
    };

    return (
        <div className="max-w-lg mx-auto py-8">
            <CheckoutSteps step1 step2 /> {/* Highlight Shipping and Payment steps */}
            
            <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Select Payment Method</h2>

                <form onSubmit={submitHandler} className="space-y-6">
                    <div className="space-y-4">
                        {/* Razorpay Option */}
                        <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition duration-150">
                            <input 
                                type="radio" 
                                id="razorpay" 
                                name="paymentMethod" 
                                value="Razorpay" 
                                checked={selectedMethod === 'Razorpay'}
                                onChange={(e) => setSelectedMethod(e.target.value)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            />
                            <label htmlFor="razorpay" className="ml-3 block text-lg font-medium text-gray-700 cursor-pointer">
                                Razorpay (Credit Card / UPI / Netbanking)
                            </label>
                        </div>

                        {/* PayPal Option */}
                        <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition duration-150">
                            <input 
                                type="radio" 
                                id="paypal" 
                                name="paymentMethod" 
                                value="PayPal" 
                                checked={selectedMethod === 'PayPal'}
                                onChange={(e) => setSelectedMethod(e.target.value)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            />
                            <label htmlFor="paypal" className="ml-3 block text-lg font-medium text-gray-700 cursor-pointer">
                                PayPal or Credit Card
                            </label>
                        </div>
                        
                        {/* Cash On Delivery Option */}
                        <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition duration-150">
                            <input 
                                type="radio" 
                                id="cod" 
                                name="paymentMethod" 
                                value="COD" 
                                checked={selectedMethod === 'COD'}
                                onChange={(e) => setSelectedMethod(e.target.value)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            />
                            <label htmlFor="cod" className="ml-3 block text-lg font-medium text-gray-700 cursor-pointer">
                                Cash On Delivery (COD)
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                    >
                        Continue to Place Order
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentScreen;