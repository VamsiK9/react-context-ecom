// client/src/pages/ShippingScreen.jsx

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartWishlistContext } from '../context/cartWishlist/CartWishlistContext';
import CheckoutSteps from '../components/CheckoutSteps';

const ShippingScreen = () => {
    const { shippingAddress, cartItems, saveShippingAddress } = useContext(CartWishlistContext);
    const navigate = useNavigate();

    // Initialize state with stored shipping address or empty strings
    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    const [country, setCountry] = useState(shippingAddress.country || '');
    
    // Redirect if cart is empty
    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    const submitHandler = (e) => {
        e.preventDefault();
        const data = { address, city, postalCode, country };
        saveShippingAddress(data);
        navigate('/payment'); // Move to the next step
    };

    return (
        <div className="max-w-xl mx-auto py-8">
            <CheckoutSteps step1 /> {/* Highlight Shipping step */}
            
            <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Shipping Details</h2>

                <form onSubmit={submitHandler} className="space-y-6">
                    {/* Address */}
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <input type="text" id="address" required value={address} onChange={(e) => setAddress(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your full address"
                        />
                    </div>

                    {/* City */}
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                        <input type="text" id="city" required value={city} onChange={(e) => setCity(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter city"
                        />
                    </div>

                    {/* Postal Code */}
                    <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                        <input type="text" id="postalCode" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter postal code"
                        />
                    </div>

                    {/* Country */}
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                        <input type="text" id="country" required value={country} onChange={(e) => setCountry(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter country"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                    >
                        Continue to Payment
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ShippingScreen;