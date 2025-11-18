import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
// FIX: Added .jsx extension and replaced Fa icons with Lucide icons
import { AuthContext } from '../context/auth/AuthContext.jsx';
import { CartWishlistContext } from '../context/cartWishlist/CartWishlistContext.jsx';
import { ShoppingCart, User, LogOut, Heart, PackagePlus } from 'lucide-react'; // Used Lucide Icons

const Header = () => {
    const { userInfo, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartWishlistContext);

    // Assuming the userInfo object has an 'isAdmin' or similar field to identify hosts/admins
    const isHostOrAdmin = userInfo && userInfo.isAdmin; 

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const logoutHandler = () => {
        logout();
    };

    // Debug: log current userInfo to help trace isAdmin
    useEffect(() => {
        console.log('HEADER: userInfo ->', userInfo);
    }, [userInfo]);

    // Close the menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    return (
        <header className="bg-gray-800 text-white shadow-lg">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold tracking-wider hover:text-indigo-400 transition duration-150">
                    E-Com Context
                </Link>

                <nav className="flex items-center space-x-6">
                    {/* Cart Icon */}
                    <Link to="/cart" className="flex items-center hover:text-indigo-400 transition duration-150">
                        <ShoppingCart className="mr-1 w-5 h-5" /> Cart
                        {cartCount > 0 && (
                            <span className="ml-1 bg-red-600 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Wishlist Icon */}
                    <Link to="/wishlist" className="flex items-center hover:text-indigo-400 transition duration-150">
                        <Heart className="mr-1 w-5 h-5" /> Wishlist
                    </Link>

                    {userInfo ? (
                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setMenuOpen((s) => !s)} className="flex items-center text-sm font-medium px-3 py-2 rounded hover:bg-gray-700 transition duration-150">
                                <User className="mr-1 w-5 h-5" /> {userInfo.name}
                            </button>
                            <div className={`absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-1 z-20 transition duration-150 ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>

                                {/* HOST/ADMIN LINK: Add Product */}
                                {isHostOrAdmin && (
                                    <Link to="/admin/product/create" className="block px-4 py-2 text-sm text-green-600 hover:bg-gray-100 font-semibold">
                                        <div className="flex items-center">
                                            <PackagePlus className="mr-2 w-5 h-5" /> Add Product
                                        </div>
                                    </Link>
                                )}

                                <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">
                                    Profile
                                </Link>
                                <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-100">
                                    My Orders
                                </Link>
                                <button
                                    onClick={logoutHandler}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    <LogOut className="mr-2 w-5 h-5" /> Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="flex items-center hover:text-indigo-400 transition duration-150">
                            <User className="mr-1 w-5 h-5" /> Sign In
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;