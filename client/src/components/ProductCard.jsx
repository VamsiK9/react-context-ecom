// client/src/components/ProductCard.jsx (UPDATED)

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaEye, FaBook } from 'react-icons/fa';
import { CartWishlistContext } from '../context/cartWishlist/CartWishlistContext'; // Import context

const ProductCard = ({ product }) => {
    const { cartItems, wishlistItems, addToCart, removeFromCart, addToWishlist, removeFromWishlist } = useContext(CartWishlistContext);
    
    // Check if the product is in the respective lists
    const inCart = cartItems.find((item) => item.product === product._id);
    const inWishlist = wishlistItems.find((item) => item.product === product._id);

    // Handler to toggle Cart status
    const handleCartToggle = () => {
        if (inCart) {
            removeFromCart(product._id);
        } else {
            // Default quantity is 1 when adding from the product card
            addToCart({
                product: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                countInStock: product.countInStock,
                qty: 1, 
            });
        }
    };
    
    // Handler to toggle Wishlist status
    const handleWishlistToggle = () => {
        if (inWishlist) {
            removeFromWishlist(product._id);
        } else {
            // Add minimal product details to the wishlist
            addToWishlist({
                product: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
            });
        }
    };

    // Placeholder for Book Now (will be connected later)
    const handleBookNow = () => { console.log(`Booking ${product.name} (Flow starts from here)`); }; 

    return (
        <div className="bg-white rounded-lg shadow-xl overflow-hidden transform hover:scale-[1.02] transition duration-300 border border-gray-100">
            <Link to={`/product/${product._id}`}>
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
            </Link>
            
            <div className="p-4">
                <Link to={`/product/${product._id}`}>
                    <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 transition duration-150 truncate">{product.name}</h3>
                </Link>
                {/* ... (price/rating display remains the same) ... */}
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
                    <span className="text-sm text-yellow-500 font-medium">★ {product.rating.toFixed(1)} ({product.numReviews})</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                    {/* View Button */}
                    <Link 
                        to={`/product/${product._id}`} 
                        className="flex items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition duration-150"
                    >
                        <FaEye className="mr-1" /> View
                    </Link>

                    {/* Book Button (Direct to checkout/payment) */}
                    <button 
                        onClick={handleBookNow} 
                        className="flex items-center justify-center p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-150"
                    >
                        <FaBook className="mr-1" /> Book
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    {/* Cart Button */}
                    <button 
                        onClick={handleCartToggle} 
                        disabled={product.countInStock === 0 && !inCart}
                        className={`flex items-center justify-center p-2 rounded-md transition duration-150 ${inCart ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'} ${product.countInStock === 0 && !inCart ? 'disabled:bg-gray-400' : ''}`}
                    >
                        <FaShoppingCart className="mr-1" /> 
                        {product.countInStock === 0 && !inCart ? 'Out of Stock' : inCart ? 'Remove' : 'Add to Cart'}
                    </button>

                    {/* Wishlist Button */}
                    <button 
                        onClick={handleWishlistToggle} 
                        className={`flex items-center justify-center p-2 rounded-md transition duration-150 ${inWishlist ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-pink-500 text-white hover:bg-pink-600'}`}
                    >
                        <FaHeart className="mr-1" /> 
                        {inWishlist ? 'Remove' : 'Wishlist'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;