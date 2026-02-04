import React, { useState, useRef } from 'react';
import { X, Check, Camera, Upload } from 'lucide-react';
import { Button } from '../Button';

export const CompleteTaskModal = ({ isOpen, onClose, onComplete, task, theme }) => {
    const [checkedItems, setCheckedItems] = useState(() => {
        if (!task) return {};
        return (task.checklist || []).reduce((acc, item) => ({
            ...acc,
            [item.id]: false
        }), {});
    });
    const [photo, setPhoto] = useState(null);
    const fileInputRef = useRef(null);

    if (!isOpen || !task) return null;

    const handleCheck = (id) => {
        setCheckedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(URL.createObjectURL(file));
        }
    };

    const requiredItemsChecked = (task.checklist || []).filter(i => !i.optional).every(i => checkedItems[i.id]);
    const canComplete = requiredItemsChecked && (!task.requirePhoto || photo);

    const calculateTotalPoints = () => {
        let points = task.basePoints;
        (task.checklist || []).forEach(item => {
            if (checkedItems[item.id]) points += item.points;
        });
        return points;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
                <div className={`p-6 text-center text-white relative overflow-hidden ${theme?.bg || 'bg-violet-600'}`}>
                    <h2 className="text-2xl font-bold relative z-10">{task.title}</h2>
                    <p className="opacity-90 relative z-10">{task.basePoints} pts base</p>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-20">
                        <X size={18} />
                    </button>
                    {/* Background pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Checklist */}
                    {(task.checklist && task.checklist.length > 0) && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Requirements</h3>
                            {task.checklist.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleCheck(item.id)}
                                    className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all
                                        ${checkedItems[item.id]
                                            ? `${theme?.bg || 'bg-violet-600'} border-transparent text-white shadow-md`
                                            : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                                        ${checkedItems[item.id] ? 'border-white bg-white/20' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {checkedItems[item.id] && <Check size={12} strokeWidth={3} />}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <span className={`font-medium text-sm ${checkedItems[item.id] ? '' : 'text-gray-700 dark:text-gray-200'}`}>{item.text}</span>
                                    </div>
                                    <span className="text-xs font-bold px-2 py-0.5 bg-white/20 rounded-md">+{item.points}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Photo Upload */}
                    {task.requirePhoto && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Proof of Work</h3>
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
                                    ${photo ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-violet-400 hover:bg-gray-50'}`}
                            >
                                {photo ? (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                                        <img src={photo} alt="Proof" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="text-white font-bold text-sm">Change Photo</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                            <Camera size={24} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-500">Tap to take photo</span>
                                    </>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" hidden />
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 pb-safe">
                    <div className="flex justify-between items-end mb-4 px-2">
                        <span className="text-sm text-gray-500">Total Earned</span>
                        <span className={`text-3xl font-bold ${theme?.text || 'text-violet-600'}`}>{calculateTotalPoints()} <span className="text-base text-gray-400 font-normal">pts</span></span>
                    </div>
                    <Button fullWidth onClick={() => onComplete({ task, checkedItems, photo, earnedPoints: calculateTotalPoints() })} themeColor={theme} disabled={!canComplete}>
                        Collect Points
                    </Button>
                </div>
            </div>
        </div>
    );
};
