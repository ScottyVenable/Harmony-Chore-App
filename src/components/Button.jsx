import React from 'react';

export const Button = ({ children, onClick, variant = "primary", className = "", type = "button", themeColor, disabled, fullWidth }) => {
    const baseStyle = "px-4 py-3.5 rounded-xl font-semibold text-[15px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: `${themeColor?.bg || 'bg-violet-600'} text-white shadow-lg shadow-${themeColor?.name || 'violet'}-500/20 hover:shadow-${themeColor?.name || 'violet'}-500/40 active:scale-95`,
        secondary: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95",
        ghost: "text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5",
        danger: "bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20",
        outline: "border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 active:bg-gray-50 dark:active:bg-gray-800"
    };

    return (
        <button type={type} disabled={disabled} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}>
            {children}
        </button>
    );
};
