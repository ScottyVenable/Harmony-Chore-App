import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Camera, ListChecks } from 'lucide-react';
import { Button } from '../Button';
import { Switch } from '../Switch';
import { CategoryIcon } from '../CategoryIcon';

const defaultState = {
    title: '',
    categoryId: '', // Will be set in effect
    basePoints: 20,
    checklist: [],
    requirePhoto: false
};

export const CreateTaskModal = ({ isOpen, onClose, onSave, categories, initialData, theme }) => {

    const [formData, setFormData] = useState(defaultState);
    const [checklistInput, setChecklistInput] = useState({ text: '', points: 10, optional: false });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({ ...defaultState, categoryId: categories[0]?.id });
            }
            setChecklistInput({ text: '', points: 10, optional: false });
        }
    }, [isOpen, initialData, categories]);

    const handleSave = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const addChecklistItem = () => {
        if (!checklistInput.text.trim()) return;
        setFormData(prev => ({
            ...prev,
            checklist: [...(prev.checklist || []), { id: `item-${Date.now()}`, ...checklistInput }]
        }));
        setChecklistInput({ text: '', points: 10, optional: false });
    };

    const removeChecklistItem = (id) => {
        setFormData(prev => ({
            ...prev,
            checklist: prev.checklist.filter(i => i.id !== id)
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="text-lg font-bold dark:text-white">
                        {initialData ? 'Edit Task' : 'New Task'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Task Name</label>
                        <input
                            autoFocus
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Wash the dishes"
                            className="w-full text-lg font-bold bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:outline-none py-2 dark:text-white transition-colors"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFormData({ ...formData, categoryId: cat.id })}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl min-w-[80px] border-2 transition-all
                                        ${formData.categoryId === cat.id
                                            ? `${theme?.bg || 'bg-violet-600'} text-white border-transparent shadow-lg scale-105`
                                            : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-500'}`}
                                >
                                    <CategoryIcon iconKey={cat.iconKey} />
                                    <span className="text-xs font-medium truncate w-full text-center">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Points & Requirements */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Base Points</label>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setFormData({ ...formData, basePoints: Math.max(5, formData.basePoints - 5) })} className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow flex items-center justify-center font-bold">-</button>
                                <span className="flex-1 text-center font-bold text-xl dark:text-white">{formData.basePoints}</span>
                                <button onClick={() => setFormData({ ...formData, basePoints: formData.basePoints + 5 })} className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow flex items-center justify-center font-bold">+</button>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Photo Proof</label>
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Camera size={18} />
                                    <span className="text-xs">Required</span>
                                </div>
                                <Switch checked={formData.requirePhoto} onChange={() => setFormData({ ...formData, requirePhoto: !formData.requirePhoto })} themeColor={theme} />
                            </div>
                        </div>
                    </div>

                    {/* Checklist */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Checklist (Optional)</label>
                        <div className="space-y-3 mb-3">
                            {formData.checklist?.map(item => (
                                <div key={item.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in slide-in-from-left-2">
                                    <ListChecks size={16} className="text-gray-400" />
                                    <div className="flex-1">
                                        <div className="font-medium text-sm dark:text-gray-200">{item.text}</div>
                                        <div className="text-xs text-gray-400">+{item.points} pts {item.optional ? '(Bonus)' : '(Required)'}</div>
                                    </div>
                                    <button onClick={() => removeChecklistItem(item.id)} className="text-red-400 hover:text-red-600 p-2">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Item Input */}
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 space-y-2">
                                <input
                                    placeholder="Add step..."
                                    value={checklistInput.text}
                                    onChange={e => setChecklistInput({ ...checklistInput, text: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    onKeyDown={e => e.key === 'Enter' && addChecklistItem()}
                                />
                                <div className="flex gap-2">
                                    <label className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer select-none">
                                        <input type="checkbox" checked={checklistInput.optional} onChange={e => setChecklistInput({ ...checklistInput, optional: e.target.checked })} className="rounded text-violet-600 focus:ring-violet-500" />
                                        Bonus Task
                                    </label>
                                    <select
                                        value={checklistInput.points}
                                        onChange={e => setChecklistInput({ ...checklistInput, points: parseInt(e.target.value) })}
                                        className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 focus:outline-none"
                                    >
                                        <option value="5">5 pts</option>
                                        <option value="10">10 pts</option>
                                        <option value="20">20 pts</option>
                                        <option value="50">50 pts</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={addChecklistItem} disabled={!checklistInput.text.trim()} className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-violet-100 hover:text-violet-600 transition-colors disabled:opacity-50">
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 mt-auto bg-white dark:bg-gray-900 pb-safe">
                    <Button fullWidth onClick={handleSave} themeColor={theme} disabled={!formData.title.trim()}>
                        {initialData ? 'Save Changes' : 'Create Task'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
