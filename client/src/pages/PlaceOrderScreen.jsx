import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartWishlistContext } from '../context/cartWishlist/CartWishlistContext'; // Keeping your context name
import { AuthContext } from '../context/auth/AuthContext'; // Keeping your context name
import CheckoutSteps from '../components/CheckoutSteps';

// ----------------------------------------------------------------
// UI Imports & Internal Modal (Replacing forbidden alert/confirm)
// ----------------------------------------------------------------
import { MapPin, CreditCard, ListOrdered, AlertTriangle, Loader2, X, CheckCircle } from 'lucide-react'; 

// Custom Modal (To replace window.confirm/alert)
const CustomModal = ({ message, type, onClose }) => {
    if (!message) return null;
    const colors = type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700';
    const Icon = type === 'error' ? AlertTriangle : CheckCircle;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`max-w-md w-full p-6 rounded-xl shadow-2xl ${colors}`}>
                <div className="flex justify-between items-start">
                    <Icon className="w-6 h-6 mr-3 mt-1" />
                    <p className="flex-1 text-lg font-medium">{message}</p>
                    <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
// ----------------------------------------------------------------


// Helper function to format price to two decimal places.
const addDecimals = (num) => {
    return (Math.round(Number(num) * 100) / 100).toFixed(2);
};

/**
 * Utility function to dynamically load the Razorpay SDK script.
 * @param {string} src 
 * @returns {Promise<boolean>}
 */
const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};


// ----------------------------------------------------------------
// Razorpay Client-Side Logic (Handles popup and verification call)
// ----------------------------------------------------------------
const displayRazorpay = (razorpayDetails, userInfo, proshopOrderId, setLoading, setError, setModalMessage, navigate, clearCart) => {
    if (!window.Razorpay) {
        setError('Razorpay SDK failed to load. Please refresh.');
        setLoading(false);
        return;
    }

    const { razorpayOrderId, razorpayKeyId, amount } = razorpayDetails;
    // Razorpay amounts are expected in the smallest unit (Paise for INR)
    const amountInPaise = Math.round(amount * 100); 

    // This handler runs ONLY on successful payment from the Razorpay popup
    const handlePaymentSuccess = async (response) => {
        setLoading(true); // Re-engage loading state for verification
        setError(null);
        
        try {
            // 2. REAL POST to Backend for Verification (PUT /api/orders/:id/pay)
            const verificationResponse = await fetch(`/api/orders/${proshopOrderId}/pay`, { 
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                },
                credentials: 'include',
                body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                }),
            });

            const verificationData = await verificationResponse.json();

            if (verificationResponse.ok) {
                // Payment and verification successful!
                clearCart();
                setModalMessage({ message: "Payment Successful! Redirecting to order details.", type: 'success' });
                setTimeout(() => navigate(`/order/${proshopOrderId}`), 1000);
            } else {
                // Verification failed
                setError(verificationData.message || `Payment verification failed. Order ID: ${proshopOrderId}. Check your order status.`);
                setModalMessage({ message: `Verification failed. Check order status in your profile.`, type: 'error' });
                setTimeout(() => navigate(`/order/${proshopOrderId}`), 2500); 
            }
        } catch (err) {
            setError(`Verification Network Error. Order ID: ${proshopOrderId}`);
            setModalMessage({ message: `Verification failed due to network error.`, type: 'error' });
            setLoading(false);
        }
    };

    const options = {
        key: razorpayKeyId, 
        amount: amountInPaise, 
        currency: 'INR',
        name: 'ProShop E-Commerce',
        description: `Order Total: ₹${addDecimals(amount)}`,
        order_id: razorpayOrderId, 
        handler: handlePaymentSuccess,
        prefill: {
            name: userInfo.name,
            email: userInfo.email,
            contact: userInfo.contact || '', // Use contact if available
        },
        theme: { color: '#4f46e5' },
        modal: {
            ondismiss: () => {
                // User closed the popup before payment (cancellation)
                setModalMessage({ message: `Payment was cancelled. You can retry from the Order details page.`, type: 'error' });
                setLoading(false); 
            }
        }
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
    // Loading indicator state is managed within the payment flow
};


const PlaceOrderScreen = () => {
    const { cartItems, shippingAddress, paymentMethod, clearCart } = useContext(CartWishlistContext);
    const { userInfo } = useContext(AuthContext);
    const navigate = useNavigate();

    // Local state for API status and UI feedback
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalMessage, setModalMessage] = useState(null);
    const [razorpayReady, setRazorpayReady] = useState(false); 

    // Calculate Prices
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 1000 ? 0 : 50; 
    const taxPrice = itemsPrice * 0.15;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;
    
    // Prepare order details for submission (SEND RAW NUMBERS, NOT STRINGS)
    const orderDetails = {
        orderItems: cartItems.map(item => ({
            name: item.name, qty: item.qty, image: item.image, price: item.price, product: item.product,
        })),
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        // Send raw numbers for the backend to use/verify
        itemsPrice: itemsPrice,
        shippingPrice: shippingPrice,
        taxPrice: taxPrice,
        totalPrice: totalPrice,
    };


    // Redirect guards & Razorpay SDK loading
    useEffect(() => {
        // Load Razorpay Script
        loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js').then(isLoaded => {
            if (isLoaded) {
                setRazorpayReady(true);
            } else {
                setError('Razorpay SDK failed to load. Cannot proceed with payment.');
            }
        });

        // Redirect guards
        if (!shippingAddress || !shippingAddress.address) { navigate('/shipping'); } 
        else if (!paymentMethod) { navigate('/payment'); } 
        else if (cartItems.length === 0) { navigate('/cart'); }
        else if (!userInfo) { navigate('/login'); }
    }, [shippingAddress, paymentMethod, cartItems, navigate, userInfo]);


    // Handle Order Submission (API call)
    const placeOrderHandler = async () => {
        if (!userInfo || !paymentMethod || !razorpayReady || cartItems.length === 0) {
            setError('Cannot proceed: Missing details or payment system not ready.');
            return;
        }

        setLoading(true);
        setError(null);
        setModalMessage(null);

        try {
            // 1. REAL POST to Backend to Create Order (POST /api/orders)
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(orderDetails),
            });

            const data = await response.json();

            if (response.ok) {
                const proshopOrderId = data._id; // Your internal ID
                
                if (paymentMethod === 'Razorpay' && data.razorpayOrderId) {
                    // Start the payment gateway process using the data returned by the server
                    displayRazorpay(
                        { 
                            razorpayOrderId: data.razorpayOrderId, 
                            razorpayKeyId: data.razorpayKeyId, 
                            amount: data.amount || totalPrice // Use server amount if provided, otherwise use calculated total
                        }, 
                        userInfo, 
                        proshopOrderId, 
                        setLoading, 
                        setError, 
                        setModalMessage, 
                        navigate, 
                        clearCart
                    );
                
                } else if (paymentMethod !== 'Razorpay') {
                    // Handle non-gateway payments (e.g., COD)
                    clearCart();
                    setModalMessage({ message: "Order Placed Successfully (COD).", type: 'success' });
                    setTimeout(() => navigate(`/order/${proshopOrderId}`), 1000);
                } else {
                    // Razorpay selected, but server didn't provide required keys/IDs
                    setError('Razorpay setup failed on the server. Please contact support.');
                    setLoading(false);
                }

            } else {
                // Failure: Handle server-side errors
                setError(data.message || 'Failed to place order.');
                setLoading(false);
            }

        } catch (err) {
            console.error(err);
            setError(`Network Error during order submission: ${err.message}`);
            setLoading(false);
        }
    };

    const isPlaceOrderDisabled = cartItems.length === 0 || loading || !paymentMethod || !razorpayReady;

    return (
        <div className="py-8 bg-gray-50 min-h-screen font-sans">
            <CustomModal 
                message={modalMessage?.message} 
                type={modalMessage?.type || 'error'} 
                onClose={() => setModalMessage(null)} 
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Place Order</h1>
                {/* Corrected step props: assuming we are on the final step, all are true */}
                <CheckoutSteps step1={true} step2={true} step3={true} /> 

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Column 1 & 2: Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Shipping Address Card */}
                        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-4 border-b pb-3">
                                <MapPin className='w-6 h-6 mr-3 text-indigo-600' /> Shipping Address
                            </h2>
                            <p className="text-gray-700 font-medium">{shippingAddress.address}, {shippingAddress.city}</p>
                            <p className="text-gray-500">{shippingAddress.postalCode}, {shippingAddress.country}</p>
                            <Link to='/shipping' className='text-sm text-indigo-600 hover:underline mt-2 inline-block'>Change Address</Link>
                        </div>

                        {/* Payment Method Card */}
                        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-4 border-b pb-3">
                                <CreditCard className='w-6 h-6 mr-3 text-indigo-600' /> Payment Method
                            </h2>
                            <p className="text-gray-700 font-medium">Method: 
                                <span className='ml-2 font-extrabold text-xl text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full inline-block'>{paymentMethod}</span>
                            </p>
                            {paymentMethod === 'Razorpay' && (
                                <p className="text-sm text-gray-500 mt-2">
                                    (Payment via secure gateway. You will see the **Razorpay popup**.)
                                </p>
                            )}
                            <Link to='/payment' className='text-sm text-indigo-600 hover:underline mt-2 inline-block'>Change Method</Link>
                        </div>

                        {/* Order Items Card */}
                        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-4 border-b pb-3">
                                <ListOrdered className='w-6 h-6 mr-3 text-indigo-600' /> Order Items
                            </h2>
                            
                            {cartItems.length === 0 ? (
                                <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg flex items-center">
                                    <AlertTriangle className='mr-3 w-5 h-5' /> Your cart is empty.
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {cartItems.map((item) => (
                                        <div key={item.product} className="flex items-center justify-between border-b border-gray-100 last:border-b-0 pb-3">
                                            <div className="flex items-center">
                                                <img 
                                                    src={item.image || "https://placehold.co/64x64/E0E7FF/4f46e5?text=N/A"} 
                                                    alt={item.name} 
                                                    className="w-16 h-16 object-cover rounded-lg mr-4 border border-gray-200 shadow-sm"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/64x64/E0E7FF/4f46e5?text=N/A"; }}
                                                />
                                                <Link to={`/product/${item.product}`} className="text-lg text-indigo-600 hover:text-indigo-800 font-medium transition duration-150">
                                                    {item.name}
                                                </Link>
                                            </div>
                                            <div className="text-gray-800 text-right font-mono">
                                                {item.qty} x ₹{addDecimals(item.price)} = 
                                                <span className='font-bold text-gray-900 ml-2'>₹{addDecimals(item.qty * item.price)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column 3: Order Summary (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-2xl sticky top-8">
                            <h2 className="text-2xl font-extrabold mb-4 border-b pb-3 text-gray-900">Summary & Checkout</h2>
                            
                            <div className="space-y-3 text-gray-700">
                                <p className="flex justify-between">
                                    <span className="font-medium">Items Price:</span>
                                    <span className='font-semibold'>₹{addDecimals(itemsPrice)}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="font-medium">Shipping:</span>
                                    <span className={`font-semibold ${shippingPrice === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                        {shippingPrice === 0 ? 'FREE' : `₹${addDecimals(shippingPrice)}`}
                                    </span>
                                </p>
                                <p className="flex justify-between border-b border-gray-100 pb-3">
                                    <span className="font-medium">Tax (15%):</span>
                                    <span className='font-semibold'>₹{addDecimals(taxPrice)}</span>
                                </p>
                            </div>

                            <div className="mt-4 pt-4 flex justify-between font-bold text-3xl text-indigo-700 border-t border-gray-200">
                                <span>Total Order:</span>
                                <span>₹{addDecimals(totalPrice)}</span>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm font-medium border border-red-200">
                                    <AlertTriangle className='inline w-4 h-4 mr-2'/> {error}
                                </div>
                            )}
                            
                            {/* Loading Indicator */}
                            {loading && (
                                <div className="mt-4 flex items-center justify-center p-3 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold">
                                    <Loader2 className="animate-spin w-5 h-5 mr-3 text-indigo-600" />
                                    Processing Order...
                                </div>
                            )}
                             {!razorpayReady && paymentMethod === 'Razorpay' && (
                                <div className="mt-4 flex items-center justify-center p-3 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-semibold">
                                    <Loader2 className="animate-spin w-5 h-5 mr-3" />
                                    Loading Payment Gateway...
                                </div>
                            )}

                            <button
                                onClick={placeOrderHandler}
                                disabled={isPlaceOrderDisabled}
                                className={`mt-6 w-full py-4 text-white rounded-xl text-xl font-extrabold tracking-wider shadow-lg transition duration-200 transform hover:scale-[1.01] ${
                                    isPlaceOrderDisabled
                                        ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/50'
                                }`}
                            >
                                {loading ? 'Processing...' : `Pay ₹${addDecimals(totalPrice)} & Place Order`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderScreen;