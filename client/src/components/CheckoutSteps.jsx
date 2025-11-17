// client/src/components/CheckoutSteps.jsx (FIXED: Using inline CSS px dimensions for SVG)

import React from 'react';

// Placeholder component for Link, since we are in a single-file environment without routing
const Link = ({ to, children, className }) => (
    <a href="#" className={className} onClick={(e) => { e.preventDefault(); console.log(`Navigating to ${to}`); }}>
        {children}
    </a>
);

// Define a common style for all icons
const iconStyle = { width: '32px', height: '32px' };

// --- Inline SVG Icons (Using inline style for pixel dimensions to bypass the "auto" error) ---

const ShippingIcon = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={props.className} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
        style={iconStyle} // Explicit pixel sizing
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-3 3l-3 3m5-8h1a2 2 0 012 2v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5a2 2 0 012-2h1m4 0l-4 4m4-4l-4 4" />
    </svg>
);

const CreditCardIcon = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={props.className} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
        style={iconStyle} // Explicit pixel sizing
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const ClipboardCheckIcon = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={props.className} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
        style={iconStyle} // Explicit pixel sizing
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

// --- Component Logic ---

const steps = [
    { name: 'Shipping', path: '/shipping', Icon: ShippingIcon },
    { name: 'Payment', path: '/payment', Icon: CreditCardIcon },
    { name: 'Place Order', path: '/placeorder', Icon: ClipboardCheckIcon },
];

/**
 * Finds the index of the last step that has been enabled (prop is true).
 */
const findLastEnabledIndex = (enabledSteps) => {
    for (let i = enabledSteps.length - 1; i >= 0; i--) {
        if (enabledSteps[i]) return i;
    }
    return -1;
};

const CheckoutSteps = ({ step1, step2, step3 }) => {
    const enabledSteps = [step1, step2, step3];
    const lastEnabledIndex = findLastEnabledIndex(enabledSteps);

    return (
        <nav className="flex justify-center my-8 font-sans">
            <div className="flex items-center space-x-4 md:space-x-8">
                {steps.map((step, index) => {
                    const isReached = enabledSteps[index];
                    const isCurrent = index === lastEnabledIndex && isReached;

                    const stepContent = (
                        <div className="flex flex-col items-center p-3 rounded-xl transition duration-300 shadow-md transform active:scale-95 text-center w-24 md:w-32">
                            {/* text-base used for color inheritance only */}
                            <step.Icon className="text-base mb-1 flex-shrink-0" />
                            <span className="text-xs font-semibold whitespace-nowrap">{step.name}</span>
                        </div>
                    );

                    return (
                        <div key={step.name} className="flex items-center">
                            {isReached ? (
                                <Link 
                                    to={step.path} 
                                    className={`text-decoration-none rounded-xl block ${
                                        isCurrent 
                                            ? 'bg-indigo-600 text-white shadow-xl scale-105 hover:scale-105' // Current/Active style
                                            : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:scale-[1.03]' // Past/Completed style
                                    }`}
                                >
                                    {stepContent}
                                </Link>
                            ) : (
                                <div className="cursor-not-allowed text-gray-400 bg-gray-100 rounded-xl">
                                    {stepContent}
                                </div>
                            )}
                            
                            {index < steps.length - 1 && (
                                <div className={`w-6 md:w-12 h-0.5 mx-1 transition-colors duration-300 ${isReached ? 'bg-indigo-400' : 'bg-gray-300'}`}></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </nav>
    );
};

export default CheckoutSteps;