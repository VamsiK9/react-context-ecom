// client/src/context/auth/AuthContext.jsx

import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// 1. Initial State (no localStorage for auth; using httpOnly cookie)
const initialState = {
    userInfo: null,
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
            return { ...state, loading: false, userInfo: action.payload };

        case 'LOGIN_FAIL':
        case 'REGISTER_FAIL':
            return { ...state, loading: false, error: action.payload, userInfo: null };

        case 'LOGOUT':
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
            // send credentials to server; server sets httpOnly cookie
            await axios.post('/api/users/login', { email, password }, { withCredentials: true });
            // fetch profile using cookie
            const res = await fetch('/api/users/profile', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch profile after login');
            const data = await res.json();
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
            await axios.post('/api/users', { name, email, password, isHost }, { withCredentials: true });
            const res = await fetch('/api/users/profile', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch profile after register');
            const data = await res.json();
            dispatch({ type: 'REGISTER_SUCCESS', payload: data });
        } catch (error) {
            const message = error.response && error.response.data.message
                ? error.response.data.message
                : error.message;
            dispatch({ type: 'REGISTER_FAIL', payload: message });
        }
    };
    // ACTION: Handle User Logout
    const logout = async () => {
        try {
            await fetch('/api/users/logout', { method: 'POST', credentials: 'include' });
        } catch (e) {
            console.warn('Logout request failed', e);
        }
        dispatch({ type: 'LOGOUT' });
    };

    // On mount, try to load profile using cookie-based auth
    useEffect(() => {
        let cancelled = false;
        const loadProfile = async () => {
            try {
                const res = await fetch('/api/users/profile', { credentials: 'include' });
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled) dispatch({ type: 'LOGIN_SUCCESS', payload: data });
            } catch (e) {
                // ignore
            }
        };
        loadProfile();
        return () => { cancelled = true; };
    }, []);

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