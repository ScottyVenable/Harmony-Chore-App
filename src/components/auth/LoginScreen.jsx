import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../Button';
import { Sparkles, Mail, Lock, User, AlertCircle } from 'lucide-react';

export const LoginScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password, name);
            }
        } catch (err) {
            console.error(err);
            setError(err.message.replace('Firebase: ', ''));
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 mb-6">
                        <Sparkles size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Harmony</h1>
                    <p className="text-gray-400">Sync chores, earn rewards, live happily.</p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 shadow-xl">
                    {error && (
                        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-3 rounded-lg flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Display Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Scotty"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                                <input
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                                />
                            </div>
                        </div>

                        <Button fullWidth disabled={loading} themeColor={{ bg: 'bg-violet-600' }} className="mt-4">
                            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
