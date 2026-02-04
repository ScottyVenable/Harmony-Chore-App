import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryManagerModal } from './CategoryManagerModal';
import { describe, it, expect, vi } from 'vitest';

// Verify basic rendering without complex icon logic interference
vi.mock('../CategoryIcon', () => ({
    CategoryIcon: () => <div data-testid="mock-category-icon">Icon</div>
}));

// Mock the constants to give us a controlled list of icons for the "Add New" section
vi.mock('../../constants', () => ({
    ICON_LIBRARY: {
        'sparkles': { icon: () => <span>Icon-Sparkles</span>, label: 'General' },
        'kitchen': { icon: () => <span>Icon-Kitchen</span>, label: 'Kitchen' }
    }
}));

// Mock Lucide UI icons (close button, trash, plus)
vi.mock('lucide-react', () => ({
    X: () => <span aria-label="Close">X</span>,
    Plus: () => <span>+</span>,
    Trash2: () => <span>Trash</span>
}));

const MOCK_CATEGORIES = [
    { id: 'c1', name: 'Kitchen', iconKey: 'kitchen' }
];

const MOCK_THEME = {
    bg: 'bg-violet-600',
    text: 'text-violet-600'
};

describe('CategoryManagerModal', () => {
    it('renders existing categories', () => {
        render(
            <CategoryManagerModal
                isOpen={true}
                categories={MOCK_CATEGORIES}
                onClose={() => { }}
                onAddCategory={() => { }}
                onDeleteCategory={() => { }}
                theme={MOCK_THEME}
            />
        );
        expect(screen.getByText('Kitchen')).toBeInTheDocument();
        expect(screen.getByTestId('mock-category-icon')).toBeInTheDocument();
    });

    it('adds a new category', () => {
        const handleAdd = vi.fn();
        render(
            <CategoryManagerModal
                isOpen={true}
                categories={MOCK_CATEGORIES}
                onClose={() => { }}
                onAddCategory={handleAdd}
                onDeleteCategory={() => { }}
                theme={MOCK_THEME}
            />
        );

        const input = screen.getByPlaceholderText(/e.g. Garden/i);
        fireEvent.change(input, { target: { value: 'Garage' } });

        const addBtn = screen.getByRole('button', { name: /Add Category/i });
        fireEvent.click(addBtn);

        expect(handleAdd).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Garage',
            iconKey: 'sparkles' // Default icon
        }));
    });

    it('calls onDeleteCategory when trash icon is clicked', () => {
        const handleDelete = vi.fn();
        const twoCats = [
            { id: 'c1', name: 'Kitchen', iconKey: 'kitchen' },
            { id: 'c2', name: 'Garage', iconKey: 'car' }
        ];

        render(
            <CategoryManagerModal
                isOpen={true}
                categories={twoCats}
                onClose={() => { }}
                onAddCategory={() => { }}
                onDeleteCategory={handleDelete}
                theme={MOCK_THEME}
            />
        );

        const deleteBtn = screen.getByLabelText('Delete Kitchen');
        fireEvent.click(deleteBtn);

        expect(handleDelete).toHaveBeenCalledWith('c1');
    });
});
