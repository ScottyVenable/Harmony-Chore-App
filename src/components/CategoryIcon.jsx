import React from 'react';
import { Sparkles } from 'lucide-react';
import { ICON_LIBRARY } from '../constants';

export const CategoryIcon = ({ iconKey, size = 20, className = "" }) => {
    const IconComponent = ICON_LIBRARY[iconKey]?.icon || Sparkles;
    return <IconComponent size={size} className={className} />;
};
