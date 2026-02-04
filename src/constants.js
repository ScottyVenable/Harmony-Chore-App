import {
    Sparkles, Utensils, Sofa, Bath, Bed, Baby, Dog,
    Car, Briefcase, Coffee, Music, SunMedium,
    Cat, Rabbit, Fish, Bird, Snail, Turtle,
    Pizza, Moon, Clapperboard, Gamepad2,
    User, Smile, Star, Zap, Heart, Crown, Ghost, Skull, Rocket
} from 'lucide-react';

export const ICON_LIBRARY = {
    // Categories
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
    'outdoors': { icon: SunMedium, label: 'Outside' },

    // Avatars
    'cat': { icon: Cat, label: 'Cat' },
    'dog': { icon: Dog, label: 'Dog' },
    'rabbit': { icon: Rabbit, label: 'Rabbit' },
    'fish': { icon: Fish, label: 'Fish' },
    'bird': { icon: Bird, label: 'Bird' },
    'snail': { icon: Snail, label: 'Snail' },
    'turtle': { icon: Turtle, label: 'Turtle' },
    'user': { icon: User, label: 'User' },
    'smile': { icon: Smile, label: 'Smile' },
    'star': { icon: Star, label: 'Star' },
    'zap': { icon: Zap, label: 'Zap' },
    'heart': { icon: Heart, label: 'Heart' },
    'crown': { icon: Crown, label: 'Crown' },
    'ghost': { icon: Ghost, label: 'Ghost' },
    'skull': { icon: Skull, label: 'Skull' },
    'rocket': { icon: Rocket, label: 'Rocket' },

    // Rewards
    'pizza': { icon: Pizza, label: 'Food' },
    'sleep': { icon: Moon, label: 'Rest' },
    'movie': { icon: Clapperboard, label: 'Movie' },
    'game': { icon: Gamepad2, label: 'Game' }
};

export const INITIAL_CATEGORIES = [
    { id: 'c1', name: 'General', iconKey: 'sparkles' },
    { id: 'c2', name: 'Kitchen', iconKey: 'kitchen' },
    { id: 'c3', name: 'Living Room', iconKey: 'living' },
    { id: 'c4', name: 'Baby Care', iconKey: 'baby' },
    { id: 'c5', name: 'Pets', iconKey: 'pet' }
];

export const AVATAR_PRESETS = [
    'cat', 'dog', 'rabbit', 'fish', 'bird', 'snail',
    'turtle', 'rocket', 'ghost', 'skull', 'zap', 'crown'
];

export const MOCK_HOUSEHOLD = [
    { id: 2, name: 'Kiki', points: 1450, avatar: 'cat', image: null, isUser: false },
    { id: 3, name: 'Guest', points: 300, avatar: 'smile', image: null, isUser: false }
];

export const MOCK_REWARDS = [
    { id: 1, title: 'Takeout Night', cost: 1000, icon: 'pizza' },
    { id: 2, title: 'Sleep In (1hr)', cost: 500, icon: 'sleep' },
    { id: 3, title: 'Movie Choice', cost: 300, icon: 'movie' },
    { id: 4, title: 'New Game', cost: 5000, icon: 'game' },
];
