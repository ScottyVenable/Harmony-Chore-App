import React, { useState, useRef } from 'react';
import { Edit3, Trash2 } from 'lucide-react';

export const SwipeableTaskCard = ({ children, onEdit, onDelete, onClick, theme }) => {
    const [offsetX, setOffsetX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startX = useRef(0);
    const cardRef = useRef(null);

    // Handlers for Touch
    const handleTouchStart = (e) => {
        startX.current = e.touches[0].clientX;
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX.current;
        // Limit swipe range (-120 to 120)
        if (diff > -120 && diff < 120) { setOffsetX(diff); }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (offsetX > 60) {
            // Swiped Right -> Edit
            setOffsetX(80); // Snap open
        } else if (offsetX < -60) { // Swiped Left -> Delete
            setOffsetX(-80); // Snap open
        } else {
            setOffsetX(0); // Snap close
        }
    };

    // Handlers for Mouse (Desktop Preview)
    const handleMouseDown = (e) => {
        startX.current = e.clientX;
        setIsDragging(true);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const currentX = e.clientX;
        const diff = currentX - startX.current;
        if (diff > -120 && diff < 120) setOffsetX(diff);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (offsetX > 60) setOffsetX(80);
        else if (offsetX < -60) setOffsetX(-80);
        else setOffsetX(0);
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false);
            setOffsetX(0);
        }
    };

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden mb-3 select-none">
            {/* Background Actions Layer */}
            <div className="absolute inset-0 flex justify-between items-center px-4 rounded-2xl">
                <div className={`flex items-center gap-2 font-bold ${theme.text}`}>
                    <Edit3 size={24} />
                </div>
                <div className="flex items-center gap-2 font-bold text-red-500">
                    <Trash2 size={24} />
                </div>
            </div>

            {/* Buttons (Clickable when revealed) */}
            {offsetX > 50 && (
                <button onClick={(e) => { e.stopPropagation(); onEdit(); setOffsetX(0); }} className="absolute left-0 top-0 bottom-0 w-20 z-10 flex items-center justify-center"></button>
            )}
            {offsetX < -50 && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(); setOffsetX(0); }} className="absolute right-0 top-0 bottom-0 w-20 z-10 flex items-center justify-center"></button>
            )}

            {/* Foreground Card */}
            <div ref={cardRef} className={`relative z-20 bg-white dark:bg-gray-800 shadow-sm border
                        border-gray-100 dark:border-gray-700 rounded-2xl transition-transform duration-300 ease-out
                        ${isDragging ? 'duration-0' : ''}`} style={{ transform: `translateX(${offsetX}px)` }}
                onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave} onClick={() => {
                    if (offsetX === 0) onClick();
                    else setOffsetX(0); // Close if open
                }}
            >
                {children}
            </div>
        </div>
    );
};
