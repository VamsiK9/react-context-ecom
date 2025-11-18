// client/src/context/cartWishlist/CartWishlistContext.jsx (UPDATED: Added clearCart action)

import React, { createContext, useReducer, useEffect } from 'react';

// Helpers to load state from local storage (using __app_id for unique storage keys)
const loadFromStorage = (key, defaultValue) => {
    try {
        const serializedState = localStorage.getItem(key);
        if (serializedState === null) {
            return defaultValue;
        }
        return JSON.parse(serializedState);
    } catch (e) {
        console.warn(`Could not load ${key} from local storage`, e);
        return defaultValue;
    }
};

const initialState = {
    cartItems: loadFromStorage('cartItems', []),
    wishlistItems: loadFromStorage('wishlistItems', []),
    // --- CHECKOUT DATA ---
    shippingAddress: loadFromStorage('shippingAddress', {}),
    paymentMethod: loadFromStorage('paymentMethod', 'Razorpay'), // Default payment method
    // --- LOADING & ERROR STATES ---
    loading: false,
    error: null,
};

// Reducer for Cart and Wishlist actions
const cartWishlistReducer = (state, action) => {
    switch (action.type) {
        // --- CART ACTIONS ---
        case 'CART_ADD_ITEM': {
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x.product === item.product);

            if (existItem) {
                // Update quantity of existing item
                return {
                    ...state,
                    cartItems: state.cartItems.map((x) =>
                        x.product === existItem.product ? item : x
                    ),
                };
            } else {
                // Add new item to cart
                return {
                    ...state,
                    cartItems: [...state.cartItems, item],
                };
            }
        }
        case 'CART_REMOVE_ITEM':
            return {
                ...state,
                cartItems: state.cartItems.filter((x) => x.product !== action.payload),
            };

        case 'CART_UPDATE_QTY':
            return {
                ...state,
                cartItems: state.cartItems.map((x) =>
                    x.product === action.payload.productId
                        ? { ...x, qty: action.payload.qty }
                        : x
                ),
            };

        case 'CART_CLEAR_ITEMS':
            return {
                ...state,
                cartItems: [],
            };
        
        // --- CHECKOUT ACTIONS ---
        case 'CART_SAVE_SHIPPING_ADDRESS':
            return {
                ...state,
                shippingAddress: action.payload,
            };

        case 'CART_SAVE_PAYMENT_METHOD':
            return {
                ...state,
                paymentMethod: action.payload,
            };

        // --- WISHLIST ACTIONS ---
        case 'WISHLIST_ADD_ITEM': {
            const item = action.payload;
            const existItem = state.wishlistItems.find((x) => x.product === item.product);

            if (existItem) {
                return state;
            } else {
                return {
                    ...state,
                    wishlistItems: [...state.wishlistItems, item],
                };
            }
        }
        case 'WISHLIST_REMOVE_ITEM':
            return {
                ...state,
                wishlistItems: state.wishlistItems.filter((x) => x.product !== action.payload),
            };

        default:
            return state;
    }
};

// 3. Create Context
export const CartWishlistContext = createContext();

// 4. Create Provider Component
export const CartWishlistProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartWishlistReducer, initialState);

    // PERSISTENCE EFFECT
    useEffect(() => {
        // Save items and checkout data to local storage
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
        localStorage.setItem('shippingAddress', JSON.stringify(state.shippingAddress));
        localStorage.setItem('paymentMethod', JSON.stringify(state.paymentMethod));
    }, [state.cartItems, state.wishlistItems, state.shippingAddress, state.paymentMethod]);

    // Action creators
    const addToCart = (product) => {
        dispatch({ type: 'CART_ADD_ITEM', payload: product });
    };

    const removeFromCart = (id) => {
        dispatch({ type: 'CART_REMOVE_ITEM', payload: id });
    };

    const updateCartItemQty = (productId, qty) => {
        dispatch({ type: 'CART_UPDATE_QTY', payload: { productId, qty } });
    };

    const clearCart = () => { // NEW ACTION CREATOR
        dispatch({ type: 'CART_CLEAR_ITEMS' });
    };

    const saveShippingAddress = (data) => {
        dispatch({ type: 'CART_SAVE_SHIPPING_ADDRESS', payload: data });
    };

    const savePaymentMethod = (method) => {
        dispatch({ type: 'CART_SAVE_PAYMENT_METHOD', payload: method });
    };
    
    const addToWishlist = (product) => {
        dispatch({ type: 'WISHLIST_ADD_ITEM', payload: product });
    };

    const removeFromWishlist = (id) => {
        dispatch({ type: 'WISHLIST_REMOVE_ITEM', payload: id });
    };

    return (
        <CartWishlistContext.Provider
            value={{
                ...state,
                addToCart,
                removeFromCart,
                updateCartItemQty,
                clearCart, // NEW
                saveShippingAddress, 
                savePaymentMethod,
                addToWishlist,
                removeFromWishlist,
            }}
        >
            {children} 
        </CartWishlistContext.Provider>
    );
};