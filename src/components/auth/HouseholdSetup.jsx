import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../Button';
import { Home, Users, ArrowRight, Plus, Hash } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';

export const HouseholdSetup = () => {
    const { currentUser, userProfile } = useAuth();
    const [mode, setMode] = useState('menu'); // 'menu' | 'create' | 'join'
    const [householdName, setHouseholdName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Helper: Generate 6-char code
    const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

    async function handleCreate(e) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const code = generateCode();
            // Create Household
            const netHouseholdRef = await addDoc(collection(db, "households"), {
                name: householdName,
                inviteCode: code,
                createdAt: serverTimestamp(),
                createdBy: currentUser.uid
            });

            // Add user to household members subcollection
            await setDoc(doc(db, "households", netHouseholdRef.id, "members", currentUser.uid), {
                name: userProfile?.displayName || currentUser.email.split('@')[0],
                avatar: userProfile?.avatar || 'smile',
                role: 'admin',
                points: 0,
                joinedAt: serverTimestamp()
            });

            // Update user profile
            await updateDoc(doc(db, "users", currentUser.uid), {
                householdId: netHouseholdRef.id
            });

            // Reload page no longer needed thanks to onSnapshot
        } catch (err) {
            console.error(err);
            setError("Failed to create household.");
        }
        setLoading(false);
    }

    async function handleJoin(e) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Find household by code
            const q = query(collection(db, "households"), where("inviteCode", "==", inviteCode.toUpperCase().trim()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                throw new Error("Invalid invite code.");
            }

            const householdDoc = querySnapshot.docs[0];

            // Add user to members
            await setDoc(doc(db, "households", householdDoc.id, "members", currentUser.uid), {
                name: userProfile?.displayName || currentUser.email.split('@')[0],
                avatar: userProfile?.avatar || 'smile',
                role: 'member',
                points: 0,
                joinedAt: serverTimestamp()
            });

            // Update user profile
            await updateDoc(doc(db, "users", currentUser.uid), {
                householdId: householdDoc.id
            });

            // Reload no longer needed
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-gray-800 dark:text-white">
            <div className="w-full max-w-sm space-y-6">

                {mode === 'menu' && (
                    <div className="space-y-6 text-center animate-in fade-in zoom-in-95">
                        <div className="mx-auto w-20 h-20 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-4">
                            <Home size={40} className="text-violet-600 dark:text-violet-400" />
                        </div>
                        <h1 className="text-2xl font-bold">Welcome Home!</h1>
                        <p className="text-gray-500">Join an existing household or start a new one.</p>

                        <div className="space-y-3">
                            <button onClick={() => setMode('create')} className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                                <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600">
                                    <Plus size={24} />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold">Create Household</div>
                                    <div className="text-xs text-gray-500">I'm starting a new group</div>
                                </div>
                                <ArrowRight size={20} className="text-gray-300 group-hover:text-violet-500 transition-colors" />
                            </button>

                            <button onClick={() => setMode('join')} className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                                    <Users size={24} />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold">Join Household</div>
                                    <div className="text-xs text-gray-500">I have an invite code</div>
                                </div>
                                <ArrowRight size={20} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                            </button>
                        </div>
                        <Button fullWidth onClick={() => useAuth().logout()} className="bg-transparent text-gray-400 hover:text-red-500 mt-4">Sign Out</Button>
                    </div>
                )}

                {mode === 'create' && (
                    <div className="animate-in slide-in-from-right">
                        <button onClick={() => setMode('menu')} className="text-sm text-gray-500 mb-4 hover:text-gray-800 dark:hover:text-white">← Back</button>
                        <h2 className="text-xl font-bold mb-1">Name your Household</h2>
                        <p className="text-sm text-gray-500 mb-6">Give your home a nickname.</p>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <input
                                autoFocus
                                value={householdName}
                                onChange={e => setHouseholdName(e.target.value)}
                                placeholder="e.g. The Venables"
                                className="w-full p-4 text-lg font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none"
                            />
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <Button fullWidth disabled={!householdName.trim() || loading} themeColor={{ bg: 'bg-violet-600' }}>
                                {loading ? 'Creating...' : 'Create Household'}
                            </Button>
                        </form>
                    </div>
                )}

                {mode === 'join' && (
                    <div className="animate-in slide-in-from-right">
                        <button onClick={() => setMode('menu')} className="text-sm text-gray-500 mb-4 hover:text-gray-800 dark:hover:text-white">← Back</button>
                        <h2 className="text-xl font-bold mb-1">Enter Invite Code</h2>
                        <p className="text-sm text-gray-500 mb-6">Ask a member for the 6-character code.</p>

                        <form onSubmit={handleJoin} className="space-y-4">
                            <div className="relative">
                                <Hash className="absolute left-4 top-4 text-gray-400" />
                                <input
                                    autoFocus
                                    value={inviteCode}
                                    onChange={e => setInviteCode(e.target.value.toUpperCase())}
                                    placeholder="XYZ123"
                                    maxLength={6}
                                    className="w-full p-4 pl-12 text-lg font-bold tracking-widest uppercase bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <Button fullWidth disabled={inviteCode.length < 6 || loading} themeColor={{ bg: 'bg-emerald-600' }}>
                                {loading ? 'Joining...' : 'Join Household'}
                            </Button>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
};
