// client/src/context/auth/AuthContext.jsx

import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// 1. Initial State
const userFromStorage = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;

const initialState = {
    userInfo: userFromStorage,
    loading: false,
    error: null,
};

// 2. Reducer Function
const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_REQUEST':
        case 'REGISTER_REQUEST':
            return { ...state, loading: true, error: null };

        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
            // Save user to local storage and update state
            localStorage.setItem('userInfo', JSON.stringify(action.payload));
            return { ...state, loading: false, userInfo: action.payload };

        case 'LOGIN_FAIL':
        case 'REGISTER_FAIL':
            return { ...state, loading: false, error: action.payload, userInfo: null };

        case 'LOGOUT':
            // Clear local storage and state
            localStorage.removeItem('userInfo');
            return { ...state, userInfo: null, error: null };
            
        default:
            return state;
    }
};

// 3. Create Context
export const AuthContext = createContext();

// 4. Create Provider Component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // ACTION: Handle User Login
    const login = async (email, password) => {
        dispatch({ type: 'LOGIN_REQUEST' });
        try {
            const { data } = await axios.post('/api/users/login', { email, password });
            dispatch({ type: 'LOGIN_SUCCESS', payload: data });
        } catch (error) {
            const message = error.response && error.response.data.message
                ? error.response.data.message
                : error.message;
            dispatch({ type: 'LOGIN_FAIL', payload: message });
        }
    };
    
    // ACTION: Handle User Registration 
    const register = async (name, email, password, isHost) => {
        dispatch({ type: 'REGISTER_REQUEST' });
        try {
            const config = {
                headers: { 'Content-Type': 'application/json' },
            };
            
            // Post the new user data including the isHost flag
            const { data } = await axios.post(
                '/api/users', 
                { name, email, password, isHost }, 
                config
            );
            
            dispatch({ type: 'REGISTER_SUCCESS', payload: data });
            // Immediately log in the user after successful registration
            localStorage.setItem('userInfo', JSON.stringify(data));
        } catch (error) {
            const message = error.response && error.response.data.message
                ? error.response.data.message
                : error.message;
            dispatch({ type: 'REGISTER_FAIL', payload: message });
        }
    };
    // ACTION: Handle User Logout
    const logout = () => {
        dispatch({ type: 'LOGOUT' });
    };

    return (
        <AuthContext.Provider value={{
            ...state,
            login,
            register,
            logout,
            // Helper to get token for private routes
            getToken: () => state.userInfo ? state.userInfo.token : null, 
        }}>
            {children}
        </AuthContext.Provider>
    );
};