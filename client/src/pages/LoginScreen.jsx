// client/src/pages/LoginScreen.jsx

import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/auth/AuthContext';
import { FaSignInAlt, FaSpinner } from 'react-icons/fa';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const navigate = useNavigate();
    const { search } = useLocation();
    
    // Use Context to access state and actions
    const { login, userInfo, loading, error } = useContext(AuthContext);

    // Get the redirect path from the URL
    const redirect = search ? search.split('=')[1] : '/';

    useEffect(() => {
        // Redirect if already logged in
        if (userInfo) {
            navigate(redirect);
        }
    }, [navigate, userInfo, redirect]);

    const submitHandler = (e) => {
        e.preventDefault();
        login(email, password);
    };

    return (
        <div className="flex justify-center items-center py-10 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl border border-gray-200">
                <h2 className="text-3xl font-bold text-center text-gray-900 flex items-center justify-center">
                    <FaSignInAlt className="mr-2 text-indigo-600" /> Sign In
                </h2>
                
                {/* Display Error Message */}
                {error && <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded">{error}</div>}
                
                <form className="space-y-6" onSubmit={submitHandler}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                    >
                        {loading ? <FaSpinner className="animate-spin mr-2" /> : 'Sign In'}
                    </button>
                </form>

                <div className="text-sm text-center">
                    New Customer?{' '}
                    <Link
                        to={redirect ? `/register?redirect=${redirect}` : '/register'}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;