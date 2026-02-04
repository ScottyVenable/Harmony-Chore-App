import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginScreen } from './LoginScreen';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Auth Context
const mockLogin = vi.fn();
const mockSignup = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
        signup: mockSignup
    })
}));

describe('LoginScreen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form by default', () => {
        render(<LoginScreen />);
        expect(screen.getByText(/Sign In/i, { selector: 'button' })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
        // Name input should NOT be present
        expect(screen.queryByPlaceholderText(/e.g. Scotty/i)).not.toBeInTheDocument();
    });

    it('switches to signup mode when toggle clicked', () => {
        render(<LoginScreen />);
        const toggleBtn = screen.getByText(/Don't have an account\? Sign up/i);
        fireEvent.click(toggleBtn);

        expect(screen.getByText(/Create Account/i, { selector: 'button' })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/e.g. Scotty/i)).toBeInTheDocument();
    });

    it('calls login function with correct credentials', async () => {
        render(<LoginScreen />);

        fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'password123' } });

        const submitBtn = screen.getByText('Sign In', { selector: 'button' });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    });

    it('calls signup function with correct credentials', async () => {
        render(<LoginScreen />);

        // Switch to signup
        fireEvent.click(screen.getByText(/Don't have an account\? Sign up/i));

        fireEvent.change(screen.getByPlaceholderText(/e.g. Scotty/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'new@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'newpassword' } });

        const submitBtn = screen.getByText('Create Account', { selector: 'button' });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockSignup).toHaveBeenCalledWith('new@example.com', 'newpassword', 'Test User');
        });
    });
});
