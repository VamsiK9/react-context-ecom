// client/src/pages/RegisterScreen.jsx

import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/auth/AuthContext';
import { FaUserPlus, FaSpinner } from 'react-icons/fa';

const RegisterScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isHost, setIsHost] = useState(false); // New state for Host selection
    const [message, setMessage] = useState(null);
    
    const navigate = useNavigate();
    const { search } = useLocation();
    
    const { register, userInfo, loading, error } = useContext(AuthContext);

    const redirect = search ? search.split('=')[1] : '/';

    useEffect(() => {
        // Redirect if already logged in
        if (userInfo) {
            navigate(redirect);
        }
    }, [navigate, userInfo, redirect]);

    const submitHandler = (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        } else {
            setMessage(null);
            // Call the register action with the new isHost flag
            register(name, email, password, isHost);
        }
    };

    return (
        <div className="flex justify-center items-center py-10 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl border border-gray-200">
                <h2 className="text-3xl font-bold text-center text-gray-900 flex items-center justify-center">
                    <FaUserPlus className="mr-2 text-indigo-600" /> Sign Up
                </h2>
                
                {error && <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded">{error}</div>}
                {message && <div className="p-3 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded">{message}</div>}
                
                <form className="space-y-4" onSubmit={submitHandler}>
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" id="name" required value={name} onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                        <input type="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" id="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input type="password" id="confirmPassword" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    
                    {/* Host Checkbox */}
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="isHost"
                                name="isHost"
                                type="checkbox"
                                checked={isHost}
                                onChange={(e) => setIsHost(e.target.checked)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="isHost" className="font-medium text-gray-700">
                                Register as Host
                            </label>
                            <p className="text-gray-500 text-xs">Hosts can list products and manage inventory.</p>
                        </div>
                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                    >
                        {loading ? <FaSpinner className="animate-spin mr-2" /> : 'Register'}
                    </button>
                </form>

                <div className="text-sm text-center">
                    Have an account?{' '}
                    <Link
                        to={redirect ? `/login?redirect=${redirect}` : '/login'}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterScreen;