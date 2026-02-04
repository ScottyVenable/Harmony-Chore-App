import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { describe, it, expect, vi } from 'vitest';

// Mock Auth Context
const mockLogout = vi.fn();
const mockUser = { uid: 'test-user', displayName: 'Test User' };
const mockProfile = { householdId: 'test-house' };

vi.mock('./contexts/AuthContext', () => ({
    useAuth: () => ({
        currentUser: mockUser,
        userProfile: mockProfile,
        logout: mockLogout
    })
}));

// Mock Firebase
vi.mock('./firebase', () => ({
    db: {},
    auth: {}
}));

// Mock Firestore hooks/functions since App uses them directly
vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(),
    collection: vi.fn(),
    onSnapshot: vi.fn(() => () => { }), // Return unsubscribe fn
    query: vi.fn(),
    orderBy: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    serverTimestamp: vi.fn(),
    increment: vi.fn()
}));

describe('Harmony Chore App', () => {
    it('renders home view by default', () => {
        render(<App />);
        expect(screen.getByText(/Hello,/i)).toBeInTheDocument();
        // Since we mock profile with no points, it might show 0 or undefined, 
        // but the header 'Weekly Score' or 'Wallet Balance' should be there if leaderboard is default
        expect(screen.getByText(/Weekly Score|Wallet Balance/i)).toBeInTheDocument();
    });

    it('navigates to rewards tab', () => {
        render(<App />);
        const rewardsTabButton = screen.getByLabelText(/Rewards/i);
        fireEvent.click(rewardsTabButton);
        expect(screen.getByText(/Weekly Winner|Point Shop/i)).toBeInTheDocument();
    });

    it('opens create task modal when FAB is clicked', () => {
        render(<App />);
        // Ensure we are on home tab first
        const homeTab = screen.getByLabelText(/Home/i);
        fireEvent.click(homeTab);

        const fab = screen.getByLabelText(/Add Task/i);
        fireEvent.click(fab);
        expect(screen.getByText(/New Task/i)).toBeInTheDocument();
    });
});
