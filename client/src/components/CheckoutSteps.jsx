// client/src/components/CheckoutSteps.jsx (FIXED AND CLARIFIED)

import React from 'react';
import { Link } from 'react-router-dom';
import { FaShippingFast, FaCreditCard, FaClipboardCheck } from 'react-icons/fa';

// Array defining the steps and their properties
const steps = [
    { name: 'Shipping', path: '/shipping', Icon: FaShippingFast },
    { name: 'Payment', path: '/payment', Icon: FaCreditCard },
    { name: 'Place Order', path: '/placeorder', Icon: FaClipboardCheck },
];

/**
 * Finds the index of the last step that has been enabled (prop is true).
 * This step represents the user's current position in the checkout flow.
 */
const findLastEnabledIndex = (enabledSteps) => {
    for (let i = enabledSteps.length - 1; i >= 0; i--) {
        if (enabledSteps[i]) return i;
    }
    return -1;
};

const CheckoutSteps = ({ step1, step2, step3 }) => {
    // Collect the status of the steps from props
    const enabledSteps = [step1, step2, step3];
    const lastEnabledIndex = findLastEnabledIndex(enabledSteps);

    return (
        <nav className="flex justify-center my-8">
            <div className="flex items-center space-x-6">
                {steps.map((step, index) => {
                    // isReached: True if the corresponding prop (step1, step2, etc.) is true.
                    // This means the user can click this step to go back.
                    const isReached = enabledSteps[index];
                    
                    // isCurrent: True only for the last step that is true, indicating the current screen.
                    const isCurrent = index === lastEnabledIndex && isReached;

                    return (
                        <div key={step.name} className="flex items-center">
                            {isReached ? (
                                <Link 
                                    to={step.path} 
                                    // Dynamic styling based on whether it is the current step or a past step
                                    className={`flex flex-col items-center p-3 rounded-xl transition duration-300 shadow-md ${
                                        isCurrent 
                                            ? 'bg-indigo-600 text-white shadow-xl scale-105' // Current/Active style
                                            : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' // Past/Completed style
                                    }`}
                                >
                                    <step.Icon className="text-2xl mb-1" />
                                    <span className="text-xs font-semibold">{step.name}</span>
                                </Link>
                            ) : (
                                // Disabled step (not reached yet)
                                <div className="flex flex-col items-center p-3 rounded-xl cursor-not-allowed text-gray-400 bg-gray-100">
                                    <step.Icon className="text-2xl mb-1" />
                                    <span className="text-xs font-semibold">{step.name}</span>
                                </div>
                            )}
                            
                            {/* Separator line between steps */}
                            {index < steps.length - 1 && (
                                <div className={`w-12 h-0.5 mx-2 ${isReached ? 'bg-indigo-400' : 'bg-gray-300'}`}></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </nav>
    );
};

export default CheckoutSteps;