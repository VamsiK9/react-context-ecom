// client/src/context/cartWishlist/CartWishlistContext.jsx (UPDATED: Added clearCart action)

import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext.jsx';

// Initial state stored in memory — persisted to MongoDB per-user instead of localStorage
const initialState = {
    cartItems: [],
    wishlistItems: [],
    // --- CHECKOUT DATA ---
    shippingAddress: {},
    paymentMethod: 'Razorpay', // Default payment method
    // --- LOADING & ERROR STATES ---
    loading: false,
    error: null,
};

// Reducer for Cart and Wishlist actions
const cartWishlistReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CART':
            return { ...state, cartItems: action.payload };
        case 'SET_WISHLIST':
            return { ...state, wishlistItems: action.payload };
        case 'SET_CHECKOUT':
            return { ...state, shippingAddress: action.payload.shippingAddress || {}, paymentMethod: action.payload.paymentMethod || 'Razorpay' };
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
    const { userInfo } = useContext(AuthContext);



    // Load persisted data from server when userInfo becomes available
    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            if (!userInfo) {
                // If not logged in, clear client state
                dispatch({ type: 'SET_CART', payload: [] });
                dispatch({ type: 'SET_WISHLIST', payload: [] });
                dispatch({ type: 'SET_CHECKOUT', payload: { shippingAddress: {}, paymentMethod: 'Razorpay' } });
                return;
            }

            try {
                // Fetch cart, wishlist and checkout in parallel
                const [cartRes, wishRes, checkoutRes] = await Promise.all([
                    fetch('/api/users/cart', { credentials: 'include' }),
                    fetch('/api/users/wishlist', { credentials: 'include' }),
                    fetch('/api/users/checkout', { credentials: 'include' }),
                ]);

                if (!cancelled) {
                    if (cartRes.ok) {
                        const cart = await cartRes.json();
                        dispatch({ type: 'SET_CART', payload: cart });
                    }
                    if (wishRes.ok) {
                        const wishlist = await wishRes.json();
                        dispatch({ type: 'SET_WISHLIST', payload: wishlist });
                    }
                    if (checkoutRes.ok) {
                        const checkout = await checkoutRes.json();
                        dispatch({ type: 'SET_CHECKOUT', payload: checkout });
                    }
                }
            } catch (err) {
                console.error('Failed to load cart/wishlist/checkout from server', err);
            }
        };

        fetchData();

        return () => { cancelled = true; };
    }, [userInfo]);

    // Persistence now happens via API calls in each action creator when authenticated

    // Action creators
    const addToCart = (product) => {
        // Update local state first
        dispatch({ type: 'CART_ADD_ITEM', payload: product });

        // Persist to server if authenticated
        if (userInfo) {
            const newCart = (() => {
                const existItem = state.cartItems.find((x) => x.product === product.product);
                if (existItem) {
                    return state.cartItems.map((x) => (x.product === existItem.product ? product : x));
                }
                return [...state.cartItems, product];
            })();

            fetch('/api/users/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ cartItems: newCart }),
            }).catch((e) => console.warn('Failed to persist cart to server', e));
        }
    };

    const removeFromCart = (id) => {
        dispatch({ type: 'CART_REMOVE_ITEM', payload: id });

        if (userInfo) {
            const newCart = state.cartItems.filter((x) => x.product !== id);
            fetch('/api/users/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ cartItems: newCart }),
            }).catch((e) => console.warn('Failed to persist cart to server', e));
        }
    };

    const updateCartItemQty = (productId, qty) => {
        dispatch({ type: 'CART_UPDATE_QTY', payload: { productId, qty } });

        if (userInfo) {
            const newCart = state.cartItems.map((x) => (x.product === productId ? { ...x, qty } : x));
            fetch('/api/users/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ cartItems: newCart }),
            }).catch((e) => console.warn('Failed to persist cart to server', e));
        }
    };

    const clearCart = () => { // NEW ACTION CREATOR
        dispatch({ type: 'CART_CLEAR_ITEMS' });
        if (userInfo) {
            fetch('/api/users/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ cartItems: [] }),
            }).catch((e) => console.warn('Failed to persist cart clear to server', e));
        }
    };

    const saveShippingAddress = (data) => {
        dispatch({ type: 'CART_SAVE_SHIPPING_ADDRESS', payload: data });
        if (userInfo) {
            fetch('/api/users/checkout', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ shippingAddress: data }),
            }).catch((e) => console.warn('Failed to persist shippingAddress to server', e));
        }
    };

    const savePaymentMethod = (method) => {
        dispatch({ type: 'CART_SAVE_PAYMENT_METHOD', payload: method });
        if (userInfo) {
            fetch('/api/users/checkout', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ paymentMethod: method }),
            }).catch((e) => console.warn('Failed to persist paymentMethod to server', e));
        }
    };
    
    const addToWishlist = (product) => {
        dispatch({ type: 'WISHLIST_ADD_ITEM', payload: product });
        if (userInfo) {
            const newWish = [...state.wishlistItems];
            if (!newWish.find((x) => x.product === product.product)) newWish.push(product);
            fetch('/api/users/wishlist', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ wishlistItems: newWish }),
            }).catch((e) => console.warn('Failed to persist wishlist to server', e));
        }
    };

    const removeFromWishlist = (id) => {
        dispatch({ type: 'WISHLIST_REMOVE_ITEM', payload: id });
        if (userInfo) {
            const newWish = state.wishlistItems.filter((x) => x.product !== id);
            fetch('/api/users/wishlist', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ wishlistItems: newWish }),
            }).catch((e) => console.warn('Failed to persist wishlist to server', e));
        }
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