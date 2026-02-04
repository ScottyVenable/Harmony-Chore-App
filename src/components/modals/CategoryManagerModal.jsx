import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '../Button';
import { CategoryIcon } from '../CategoryIcon';
import { ICON_LIBRARY } from '../../constants';

export const CategoryManagerModal = ({ isOpen, onClose, categories, onAddCategory, onDeleteCategory, theme }) => {
    const [newCatData, setNewCatData] = useState({ name: '', iconKey: 'sparkles' });

    if (!isOpen) return null;

    const handleAdd = () => {
        if (!newCatData.name) return;
        onAddCategory({ ...newCatData, id: `c${Date.now()}` });
        setNewCatData({ name: '', iconKey: 'sparkles' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden h-[600px] flex flex-col">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold dark:text-white">Manage Categories</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* List */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Existing Categories</h3>
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-gray-500 shadow-sm">
                                        <CategoryIcon iconKey={cat.iconKey} size={16} />
                                    </div>
                                    <span className="font-medium dark:text-gray-200">{cat.name}</span>
                                </div>
                                <button
                                    aria-label={`Delete ${cat.name}`}
                                    onClick={() => onDeleteCategory(cat.id)}
                                    disabled={categories.length <= 1}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add New */}
                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Create New</h3>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Category Name</label>
                            <input
                                value={newCatData.name}
                                onChange={e => setNewCatData({ ...newCatData, name: e.target.value })}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                placeholder="e.g. Garden"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">Select Icon</label>
                            <div className="grid grid-cols-6 gap-2">
                                {Object.entries(ICON_LIBRARY).map(([key, { icon: IconComponent }]) => (
                                    <button
                                        key={key}
                                        onClick={() => setNewCatData({ ...newCatData, iconKey: key })}
                                        className={`aspect-square rounded-xl flex items-center justify-center transition-colors
                                            ${newCatData.iconKey === key ? 'bg-violet-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        <IconComponent size={20} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Button fullWidth onClick={handleAdd} disabled={!newCatData.name} themeColor={theme}>
                            <Plus size={18} /> Add Category
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
