import { render, screen, fireEvent } from '@testing-library/react';
import { CreateTaskModal } from './CreateTaskModal';
import { describe, it, expect, vi } from 'vitest';

const MOCK_CATEGORIES = [
    { id: 'c1', name: 'Kitchen', iconKey: 'kitchen' },
    { id: 'c2', name: 'Living Room', iconKey: 'living' }
];

const MOCK_THEME = {
    bg: 'bg-violet-600',
    text: 'text-violet-600'
};

// Verify basic rendering without complex icon logic interference
vi.mock('../CategoryIcon', () => ({
    CategoryIcon: () => <div data-testid="mock-category-icon">Icon</div>
}));

// Mock Lucide UI icons (close button, trash, plus)
vi.mock('lucide-react', () => ({
    X: () => <span aria-label="Close">X</span>,
    Plus: () => <span>+</span>,
    Trash2: () => <span>Trash</span>,
    Camera: () => <span>Camera</span>,
    ListChecks: () => <span>List</span>,
    Check: () => <span>Check</span>
}));

describe('CreateTaskModal', () => {
    it('renders nothing when closed', () => {
        render(<CreateTaskModal isOpen={false} categories={[]} />);
        expect(screen.queryByText(/New Task/i)).not.toBeInTheDocument();
    });

    it('renders form elements when open', () => {
        render(
            <CreateTaskModal
                isOpen={true}
                categories={MOCK_CATEGORIES}
                onClose={() => { }}
                onSave={() => { }}
                theme={MOCK_THEME}
            />
        );
        expect(screen.getByText(/New Task/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/e.g. Wash the dishes/i)).toBeInTheDocument();
        expect(screen.getByText(/Kitchen/i)).toBeInTheDocument();
    });

    it('disables save button initially (if title is empty)', () => {
        render(
            <CreateTaskModal
                isOpen={true}
                categories={MOCK_CATEGORIES}
                onClose={() => { }}
                onSave={() => { }}
                theme={MOCK_THEME}
            />
        );
        const saveBtn = screen.getByRole('button', { name: /Create Task/i });
        expect(saveBtn).toBeDisabled();
    });

    it('enables save button when title is entered and calls onSave', () => {
        const handleSave = vi.fn();
        render(
            <CreateTaskModal
                isOpen={true}
                categories={MOCK_CATEGORIES}
                onClose={() => { }}
                onSave={handleSave}
                theme={MOCK_THEME}
            />
        );

        const input = screen.getByPlaceholderText(/e.g. Wash the dishes/i);
        fireEvent.change(input, { target: { value: 'Clean Sink' } });

        const saveBtn = screen.getByRole('button', { name: /Create Task/i });
        expect(saveBtn).not.toBeDisabled();

        fireEvent.click(saveBtn);
        expect(handleSave).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Clean Sink',
            categoryId: 'c1' // Default category
        }));
    });
});
