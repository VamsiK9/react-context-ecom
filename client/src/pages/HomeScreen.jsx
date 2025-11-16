// client/src/pages/HomeScreen.jsx (UPDATED)

import React, { useContext, useEffect } from 'react';
import { ProductContext } from '../context/products/ProductContext';
import ProductCard from '../components/ProductCard';
import { FaSpinner } from 'react-icons/fa';

const HomeScreen = () => {
    // Use the context to get state and actions
    const { products, loading, error, fetchProducts } = useContext(ProductContext);

    useEffect(() => {
        // Fetch products when the component mounts
        fetchProducts();
    }, []); // Empty dependency array means it runs once

    return (
        <div className="py-8">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Latest Products</h1>
            
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded text-center">
                    Error loading products: {error}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomeScreen;