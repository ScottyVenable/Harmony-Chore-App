import React from 'react';

export const Card = ({ children, className = "", onClick, noHover = false }) => (
    <div onClick={onClick} className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-sm border
        border-gray-100 dark:border-gray-700/50 ${!noHover && 'active:scale-[0.98] transition-transform'} ${className}`}>
        {children}
    </div>
);
