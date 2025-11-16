// client/src/context/products/ProductContext.jsx

import React, { createContext, useReducer } from 'react';
import axios from 'axios';

// 1. Initial State
const initialState = {
    products: [],
    product: null,
    loading: false,
    error: null,
};

// 2. Reducer Function
const productReducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_PRODUCTS_REQUEST':
        case 'FETCH_PRODUCT_REQUEST':
            return { ...state, loading: true, error: null };

        case 'FETCH_PRODUCTS_SUCCESS':
            return { ...state, loading: false, products: action.payload, error: null };

        case 'FETCH_PRODUCT_SUCCESS':
            return { ...state, loading: false, product: action.payload, error: null };

        case 'FETCH_PRODUCTS_FAIL':
        case 'FETCH_PRODUCT_FAIL':
            return { ...state, loading: false, error: action.payload };

        default:
            return state;
    }
};

// 3. Create Context
export const ProductContext = createContext();

// 4. Create Provider Component
export const ProductProvider = ({ children }) => {
    const [state, dispatch] = useReducer(productReducer, initialState);

    // ACTION: Fetch all products
    const fetchProducts = async () => {
        dispatch({ type: 'FETCH_PRODUCTS_REQUEST' });
        try {
            const { data } = await axios.get('/api/products');
            dispatch({ type: 'FETCH_PRODUCTS_SUCCESS', payload: data });
        } catch (error) {
            const message = error.response && error.response.data.message
                ? error.response.data.message
                : error.message;
            dispatch({ type: 'FETCH_PRODUCTS_FAIL', payload: message });
        }
    };

    // ACTION: Fetch single product
    const fetchProductById = async (id) => {
        dispatch({ type: 'FETCH_PRODUCT_REQUEST' });
        try {
            const { data } = await axios.get(`/api/products/${id}`);
            dispatch({ type: 'FETCH_PRODUCT_SUCCESS', payload: data });
        } catch (error) {
            const message = error.response && error.response.data.message
                ? error.response.data.message
                : error.message;
            dispatch({ type: 'FETCH_PRODUCT_FAIL', payload: message });
        }
    };


    return (
        <ProductContext.Provider value={{
            ...state,
            fetchProducts,
            fetchProductById,
        }}>
            {children}
        </ProductContext.Provider>
    );
};