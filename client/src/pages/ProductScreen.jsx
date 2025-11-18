// client/src/pages/ProductScreen.jsx

import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductContext } from '../context/products/ProductContext';
import { CartWishlistContext } from '../context/cartWishlist/CartWishlistContext';
import { FaSpinner, FaShoppingCart, FaArrowLeft, FaHeart } from 'react-icons/fa';
import Rating from '../components/Rating'; // We will create this component shortly

const ProductScreen = () => {
    const [qty, setQty] = useState(1);
    const { id: productId } = useParams();
    
    // Contexts
    const { product, loading, error, fetchProductById } = useContext(ProductContext);
    const { cartItems, addToCart } = useContext(CartWishlistContext);

    // Check if the item is already in the cart
    const itemInCart = cartItems.find((item) => item.product === productId);
    
    // Fetch product details when component mounts or ID changes
    useEffect(() => {
        fetchProductById(productId);
    }, [productId]);

    // Handler to add the item to the cart
    const addToCartHandler = () => {
        if (product) {
            addToCart({
                product: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                countInStock: product.countInStock,
                qty, 
            });
            // Optional: Navigate to cart page after adding
            // navigate('/cart');
        }
    };

    return (
        <div className="py-8">
            <Link to='/' className='inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6'>
                <FaArrowLeft className='mr-2' /> Go Back
            </Link>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded text-center">
                    Error loading product: {error}
                </div>
            ) : product ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Column 1: Image */}
                    <div className="lg:col-span-1">
                        {(() => {
                            const src = product.image && product.image.startsWith('/') ? `http://localhost:5000${product.image}` : product.image;
                            return <img src={src} alt={product.name} className="w-full h-auto rounded-lg shadow-lg object-cover" />;
                        })()}
                    </div>

                    {/* Column 2: Details */}
                    <div className="lg:col-span-1 space-y-4">
                        <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
                        <p className="text-xl text-gray-700 border-b pb-2">Brand: {product.brand}</p>
                        
                        <Rating value={product.rating} text={`${product.numReviews} reviews`} />

                        <p className="text-2xl font-extrabold text-indigo-600">Price: ₹{product.price.toFixed(2)}</p>

                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-2">Description:</h3>
                            <p className="text-gray-600">{product.description}</p>
                        </div>
                    </div>

                    {/* Column 3: Status and Checkout */}
                    <div className="lg:col-span-1">
                        <div className="p-6 border rounded-lg shadow-lg bg-white">
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-lg font-medium">Price:</span>
                                <span className="text-xl font-bold">₹{product.price.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b">
                                <span className="text-lg font-medium">Status:</span>
                                <span className={product.countInStock > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                    {product.countInStock > 0 ? 'In Stock' : 'Out Of Stock'}
                                </span>
                            </div>

                            {/* Quantity Selection */}
                            {product.countInStock > 0 && (
                                <div className="flex justify-between items-center py-3 border-b">
                                    <span className="text-lg font-medium">Qty:</span>
                                    <select
                                        value={qty}
                                        onChange={(e) => setQty(Number(e.target.value))}
                                        className="p-2 border rounded"
                                    >
                                        {[...Array(product.countInStock).keys()].map((x) => (
                                            <option key={x + 1} value={x + 1}>
                                                {x + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <button
                                onClick={addToCartHandler}
                                disabled={product.countInStock === 0 || itemInCart}
                                className={`w-full mt-6 flex justify-center items-center py-3 rounded-lg font-semibold transition duration-150 ${
                                    product.countInStock === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : itemInCart
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                            >
                                <FaShoppingCart className='mr-2' /> 
                                {product.countInStock === 0
                                    ? 'Out of Stock'
                                    : itemInCart
                                    ? 'In Cart (Add Again)' // You might want 'Go to Cart' or 'Update Quantity' here
                                    : 'Add To Cart'}
                            </button>
                            
                            {/* Placeholder Wishlist Button */}
                            <button
                                className="w-full mt-2 flex justify-center items-center py-3 rounded-lg font-semibold transition duration-150 border border-pink-500 text-pink-500 hover:bg-pink-50"
                            >
                                <FaHeart className='mr-2' /> Add to Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Placeholder for Reviews Section */}
            {product && (
                <div className="mt-12">
                    <h2 className="text-3xl font-bold border-b pb-2 mb-4">Reviews</h2>
                    <p className="text-gray-600">No reviews yet.</p>
                </div>
            )}
        </div>
    );
};

export default ProductScreen;