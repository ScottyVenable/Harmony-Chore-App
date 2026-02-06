import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginScreen } from './LoginScreen';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Auth Context
const mockLogin = vi.fn();
const mockSignup = vi.fn();
const mockSignupAsGuest = vi.fn();
const mockLoginWithGoogle = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
        signup: mockSignup,
        signupAsGuest: mockSignupAsGuest,
        loginWithGoogle: mockLoginWithGoogle
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

    it('calls loginWithGoogle function when Google button clicked', async () => {
        render(<LoginScreen />);

        const googleBtn = screen.getByText(/Google/i, { selector: 'button' });
        fireEvent.click(googleBtn);

        await waitFor(() => {
            expect(mockLoginWithGoogle).toHaveBeenCalled();
        });
    });

    it('shows guest toggle in signup mode and hides email when enabled', () => {
        render(<LoginScreen />);

        // Switch to signup
        fireEvent.click(screen.getByText(/Don't have an account\? Sign up/i));

        // Guest toggle should be visible
        const guestToggle = screen.getByText(/Skip email\? Continue as Guest/i);
        expect(guestToggle).toBeInTheDocument();

        // Email field should be visible before guest toggle
        expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();

        // Click guest toggle
        fireEvent.click(guestToggle);

        // Email field should be hidden
        expect(screen.queryByPlaceholderText(/you@example.com/i)).not.toBeInTheDocument();
        // Guest mode text should update
        expect(screen.getByText(/Guest mode — no email needed/i)).toBeInTheDocument();
        // Button should say "Create Guest Account"
        expect(screen.getByText(/Create Guest Account/i, { selector: 'button' })).toBeInTheDocument();
    });

    it('calls signupAsGuest with name and password when guest mode is active', async () => {
        render(<LoginScreen />);

        // Switch to signup
        fireEvent.click(screen.getByText(/Don't have an account\? Sign up/i));

        // Fill name
        fireEvent.change(screen.getByPlaceholderText(/e.g. Scotty/i), { target: { value: 'Guest User' } });

        // Enable guest mode
        fireEvent.click(screen.getByText(/Skip email\? Continue as Guest/i));

        // Fill password
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'guestpass123' } });

        // Submit
        const submitBtn = screen.getByText('Create Guest Account', { selector: 'button' });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockSignupAsGuest).toHaveBeenCalledWith('guestpass123', 'Guest User');
        });
    });

    it('does not show guest toggle in login mode', () => {
        render(<LoginScreen />);
        expect(screen.queryByText(/Skip email\? Continue as Guest/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Guest mode/i)).not.toBeInTheDocument();
    });
});
