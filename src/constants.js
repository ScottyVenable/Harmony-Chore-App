import {
    Sparkles, Utensils, Sofa, Bath, Bed, Baby, Dog,
    Car, Briefcase, Coffee, Music, SunMedium
} from 'lucide-react';

export const ICON_LIBRARY = {
    'sparkles': { icon: Sparkles, label: 'General' },
    'kitchen': { icon: Utensils, label: 'Kitchen' },
    'living': { icon: Sofa, label: 'Living' },
    'bath': { icon: Bath, label: 'Bath' },
    'bed': { icon: Bed, label: 'Bedroom' },
    'baby': { icon: Baby, label: 'Baby' },
    'pet': { icon: Dog, label: 'Pets' },
    'car': { icon: Car, label: 'Vehicle' },
    'work': { icon: Briefcase, label: 'Work' },
    'coffee': { icon: Coffee, label: 'Morning' },
    'music': { icon: Music, label: 'Hobby' },
    'outdoors': { icon: SunMedium, label: 'Outside' }
};

export const INITIAL_CATEGORIES = [
    { id: 'c1', name: 'General', iconKey: 'sparkles' },
    { id: 'c2', name: 'Kitchen', iconKey: 'kitchen' },
    { id: 'c3', name: 'Living Room', iconKey: 'living' },
    { id: 'c4', name: 'Baby Care', iconKey: 'baby' },
    { id: 'c5', name: 'Pets', iconKey: 'pet' }
];

export const AVATAR_PRESETS = ['🦁', '🦊', '🐼', '🐻', '🐺', '🦉', '🐸', '🐯', '🐙', '🦄', '🐲', '🤖'];

export const MOCK_HOUSEHOLD = [
    { id: 2, name: 'Kiki', points: 1450, avatar: '🦊', image: null, isUser: false },
    { id: 3, name: 'Guest', points: 300, avatar: '🐼', image: null, isUser: false }
];

export const MOCK_REWARDS = [
    { id: 1, title: 'Takeout Night', cost: 1000, icon: '🍕' },
    { id: 2, title: 'Sleep In (1hr)', cost: 500, icon: '😴' },
    { id: 3, title: 'Movie Choice', cost: 300, icon: '🎬' },
    { id: 4, title: 'New Game', cost: 5000, icon: '🎮' },
];
