import React, { useState, useCallback, useContext } from 'react';
import { PlusCircle, Loader2, CheckCircle, X, AlertTriangle, Package } from 'lucide-react';
import { AuthContext } from '../context/auth/AuthContext.jsx'; // 1. IMPORT AuthContext

// --- Placeholder for User Authentication Context/Redux State ---
// These mock variables are being replaced by the values pulled from the AuthContext.
// The only constant remaining is the API Base URL.
const API_BASE_URL = 'http://localhost:5000'; // Match your server URL
// -----------------------------------------------------------------


// --- Custom Modal Component (To replace alert/confirm) ---
const CustomModal = ({ message, type, onClose }) => {
    if (!message) return null;
    const colors = type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700';
    const Icon = type === 'error' ? AlertTriangle : CheckCircle;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`max-w-sm w-full p-6 rounded-xl shadow-2xl transition duration-300 ${colors} border-2`}>
                <div className="flex justify-between items-start">
                    <Icon className="w-6 h-6 mr-3 mt-1" />
                    <div className='flex-1'>
                        <p className="text-xl font-bold mb-2">
                            {type === 'success' ? 'Product Created' : 'Error'}
                        </p>
                        <p className="font-medium">{message}</p>
                    </div>
                    
                    <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- ProductCreateScreen Component (Frontend) ---
const ProductCreateScreen = () => {
    // 2. PULL AUTH DATA FROM CONTEXT
    const { userInfo } = useContext(AuthContext); 
    
    // Derived values for API call and UI
    const userId = userInfo?._id || 'N/A (Not Logged In)';

    // State initialization based on Mongoose schema fields
    const [name, setName] = useState('');
    const [price, setPrice] = useState(''); 
    const [image, setImage] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('Electronics');
    const [countInStock, setCountInStock] = useState(''); 
    const [description, setDescription] = useState('');

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalMessage, setModalMessage] = useState(null);

    // Helper to reset form
    const resetForm = useCallback(() => {
        setName('');
        setPrice('');
        setImage('');
        setBrand('');
        setCategory('Electronics');
        setCountInStock('');
        setDescription('');
        setError(null);
    }, []);

    // Handles the actual POST request to the Mongoose/Express backend
    const submitHandler = async (e) => {
        e.preventDefault();
        setError(null);
        
        // 3. CHECK FOR AUTH BEFORE PROCEEDING
        if (!userInfo) {
            setError('User is not authenticated. Please log in as an administrator to create products.');
            return;
        }

        // Convert and validate numbers
        const priceValue = parseFloat(price);
        const stockValue = parseInt(countInStock, 10);
        
        // Frontend validation matching the Mongoose schema requirements
        if (priceValue <= 0 || stockValue < 0 || !name || !description || !brand || !category || !image || isNaN(priceValue) || isNaN(stockValue)) {
            setError('Please ensure all required fields are filled correctly. Price must be a number > 0, and stock must be a number >= 0.');
            return;
        }

        const productData = {
            name, 
            price: priceValue, 
            image, 
            brand, 
            category, 
            countInStock: stockValue, 
            description
        };

        setLoading(true);

        try {
            // --- REAL API CALL TO EXPRESS SERVER ---
            const response = await fetch(`${API_BASE_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(productData),
            });

            // Handle non-2xx status codes (e.g., 400 validation, 401 auth, 403 admin role)
            if (!response.ok) {
                 const data = await response.json();
                 // Throw the server's error message
                 throw new Error(data.message || `Product creation failed. Status: ${response.status}`);
            }

            const data = await response.json();

            console.log("Product created successfully:", data.product);
            setModalMessage({ 
                message: `Product "${data.product.name}" successfully listed!`, 
                type: 'success' 
            });
            resetForm(); 

        } catch (err) {
            console.error('Submission Error:', err);
            setError(err.message || 'Network error: Check if your Express server is running and the token is valid.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="py-12 bg-gray-50 min-h-screen font-sans">
            <CustomModal 
                message={modalMessage?.message} 
                type={modalMessage?.type || 'error'} 
                onClose={() => setModalMessage(null)} 
            />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-indigo-100">
                    <header className="mb-8 border-b pb-4">
                        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
                            <PlusCircle className='w-8 h-8 mr-3 text-indigo-600' /> Add New Product Listing
                        </h1>
                        <p className="mt-2 text-lg text-gray-500">
                            Client component for **POST /api/products** endpoint.
                        </p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                            {/* 5. DISPLAY USER ID INSTEAD OF MOCK ID */}
                            Logged-in User ID: <span className="font-mono text-xs px-2 py-0.5 bg-indigo-50 rounded-md text-indigo-800 ml-2">{userId}</span>
                        </p>
                    </header>
                    <form onSubmit={submitHandler} className="space-y-6"> {/* FORM STARTS HERE */}
                        
                        {/* Group: Core Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
                            {/* Product Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Ultra Gaming Headset X5"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                            </div>
                            
                            {/* Brand */}
                            <div>
                                <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand *</label>
                                <input
                                    type="text"
                                    id="brand"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    placeholder="e.g., Logitech, Sony, Canon"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category *</label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 bg-white"
                                >
                                    <option value="Electronics">Electronics</option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Accessories">Accessories</option>
                                    <option value="Books">Books</option>
                                </select>
                            </div>
                            
                            {/* Image URL */}
                            <div>
                                <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image URL *</label>
                                <input
                                    type="url"
                                    id="image"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    placeholder="e.g., https://placehold.co/600x400"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                            </div>
                        </div>

                        {/* Group: Price & Stock */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
                            {/* Price */}
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($) *</label>
                                <input
                                    type="number"
                                    id="price"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.01"
                                    min="0.01"
                                    step="0.01"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                            </div>
                            
                            {/* Count In Stock */}
                            <div>
                                <label htmlFor="countInStock" className="block text-sm font-medium text-gray-700">Count In Stock *</label>
                                <input
                                    type="number"
                                    id="countInStock"
                                    value={countInStock}
                                    onChange={(e) => setCountInStock(e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                            </div>
                        </div>
                        
                        {/* Group: Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description *</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                                placeholder="A detailed description of the product features and benefits."
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                            ></textarea>
                        </div>
                        
                        {/* Error Display */}
                        {error && (
                            <div className="p-4 bg-red-100 text-red-700 rounded-xl flex items-start border border-red-200">
                                <AlertTriangle className='w-5 h-5 mt-0.5 mr-3 flex-shrink-0' />
                                <span className='font-medium'>{error}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !authToken} // Disable if loading or not authenticated
                            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white transition duration-300 transform ${
                                loading || !authToken
                                    ? 'bg-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.005] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin w-5 h-5 mr-3" />
                                    Creating Product...
                                </>
                            ) : (
                                <>
                                    <Package className="w-6 h-6 mr-3" />
                                    Create Product Listing
                                </>
                            )}
                        </button>
                    </form> {/* FORM ENDS HERE */}
                </div>
            </div>
        </div>
    );
};

export default ProductCreateScreen;