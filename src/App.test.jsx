import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('Harmony Chore App', () => {
    it('renders home view by default', () => {
        render(<App />);
        expect(screen.getByText(/Hello,/i)).toBeInTheDocument();
        expect(screen.getByText(/Weekly Score/i)).toBeInTheDocument();
    });

    it('navigates to rewards tab', () => {
        render(<App />);
        const rewardsTabButton = screen.getByLabelText(/Rewards/i);
        fireEvent.click(rewardsTabButton);
        expect(screen.getByText(/Weekly Winner/i)).toBeInTheDocument();
    });

    it('opens create task modal when FAB is clicked', () => {
        render(<App />);
        const fab = screen.getByLabelText(/Add Task/i);
        fireEvent.click(fab);
        expect(screen.getByText(/New Task/i)).toBeInTheDocument();
    });
});
