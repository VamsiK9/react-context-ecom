// client/src/components/Rating.jsx

import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Rating = ({ value, text }) => {
    return (
        <div className='flex items-center space-x-1'>
            {[1, 2, 3, 4, 5].map((index) => (
                <span key={index}>
                    {value >= index ? (
                        <FaStar className='text-yellow-500' />
                    ) : value >= index - 0.5 ? (
                        <FaStarHalfAlt className='text-yellow-500' />
                    ) : (
                        <FaRegStar className='text-yellow-500' />
                    )}
                </span>
            ))}
            <span className='ml-2 text-gray-600 text-sm'>
                {text && text}
            </span>
        </div>
    );
};

export default Rating;