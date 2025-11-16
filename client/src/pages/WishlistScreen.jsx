// client/src/pages/WishlistScreen.jsx

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartWishlistContext } from '../context/cartWishlist/CartWishlistContext';
import { FaHeart, FaShoppingCart, FaTrash, FaSadTear } from 'react-icons/fa';

const WishlistScreen = () => {
    const { wishlistItems, removeFromWishlist, addToCart } = useContext(CartWishlistContext);
    
    // In a real app, you would fetch full product details for the wishlist items
    // based on their IDs here, but for this context demo, we use the minimal data saved.

    const handleMoveToCart = (item) => {
        // Add item to cart (defaulting quantity to 1)
        addToCart({
            product: item.product,
            name: item.name,
            image: item.image,
            price: item.price,
            countInStock: 10, // Placeholder stock value
            qty: 1, 
        });
        // Remove from wishlist
        removeFromWishlist(item.product);
    };

    return (
        <div className="py-8">
            <h1 className="text-4xl font-bold mb-8 flex items-center">
                <FaHeart className="mr-3 text-pink-600" /> My Wishlist
            </h1>

            {wishlistItems.length === 0 ? (
                <div className="p-10 text-center bg-gray-50 border rounded-lg">
                    <FaSadTear className="text-5xl text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-600">Your wishlist is empty.</p>
                    <Link to="/" className="text-indigo-600 hover:text-indigo-800 mt-2 block font-medium">Start Browsing</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                        <div key={item.product} className="flex flex-col p-4 bg-white border rounded-lg shadow-md">
                            <div className="flex items-center mb-4">
                                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded mr-4" />
                                
                                <div className="flex-grow">
                                    <Link to={`/product/${item.product}`} className="font-semibold text-lg hover:text-indigo-600">{item.name}</Link>
                                    <p className="text-gray-500">₹{item.price.toFixed(2)}</p>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-2 mt-auto pt-2 border-t">
                                <button
                                    onClick={() => handleMoveToCart(item)}
                                    className="flex items-center py-2 px-3 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition duration-150"
                                >
                                    <FaShoppingCart className="mr-2" /> Move to Cart
                                </button>
                                <button
                                    onClick={() => removeFromWishlist(item.product)}
                                    className="flex items-center py-2 px-3 text-red-600 border border-red-300 rounded-lg text-sm hover:bg-red-50 transition duration-150"
                                >
                                    <FaTrash className="mr-2" /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistScreen;