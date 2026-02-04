import React from 'react';

export const Switch = ({ checked, onChange, themeColor }) => (
    <button onClick={onChange} className={`w-12 h-7 rounded-full p-1 transition-colors duration-200
        ease-in-out relative ${checked ? themeColor?.bg || 'bg-violet-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200
            ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);
