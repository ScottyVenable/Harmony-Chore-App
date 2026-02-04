import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, Plus, Edit3, Trophy, Sparkles, Check,
  ChevronRight, ListChecks, Calendar, Crown, Shield, Sun, Layers,
  Activity, TrendingUp, Camera, Home, ShoppingBag, User
} from 'lucide-react';

import { Card } from './components/Card';
import { SwipeableTaskCard } from './components/SwipeableTaskCard';
import { Button } from './components/Button';
import { Switch } from './components/Switch';
import { CategoryIcon } from './components/CategoryIcon';
import { CreateTaskModal } from './components/modals/CreateTaskModal';
import { CompleteTaskModal } from './components/modals/CompleteTaskModal';
import { CategoryManagerModal } from './components/modals/CategoryManagerModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { HouseholdSetup } from './components/auth/HouseholdSetup';
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, increment } from 'firebase/firestore';
import { INITIAL_CATEGORIES, AVATAR_PRESETS, MOCK_REWARDS } from './constants';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { currentUser, userProfile, logout } = useAuth();

  // --- State ---
  const [activeTab, setActiveTab] = useState('home');
  const [modals, setModals] = useState({ create: false, complete: false, categoryManager: false });
  const [modalData, setModalData] = useState(null); // To pass data to modals (e.g. task to edit)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentDate] = useState(() => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  });

  // Settings & System
  const [themeMode, setThemeMode] = useState('system'); // 'system' | 'light' | 'dark'
  const [darkMode, setDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [rewardSystem, setRewardSystem] = useState('leaderboard');
  const [themeName, setThemeName] = useState('violet');

  // Data State
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);

  // Firestore Sync
  useEffect(() => {
    if (!userProfile?.householdId) return;

    // Sync Tasks
    const qTasks = query(collection(db, "households", userProfile.householdId, "tasks"), orderBy("createdAt", "desc"));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Sync Members
    const qMembers = query(collection(db, "households", userProfile.householdId, "members"));
    const unsubMembers = onSnapshot(qMembers, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubTasks();
      unsubMembers();
    };
  }, [userProfile?.householdId]);

  // Derived Profile (Real-time points from household member record)
  const myMemberProfile = members.find(m => m.id === currentUser?.uid) || {};
  const currentPoints = myMemberProfile.points || 0;

  // Adapter for legacy UI access
  const profile = {
    ...myMemberProfile,
    name: myMemberProfile.name || currentUser?.displayName || 'User',
    points: currentPoints,
    avatar: myMemberProfile.avatar || 'smile',
    tasksCompleted: myMemberProfile.tasksCompleted || 0,
    streak: myMemberProfile.streak || 0
  };

  const fileInputRef = useRef(null);

  const themes = {
    violet: { name: 'violet', bg: 'bg-violet-600', text: 'text-violet-600', ring: 'ring-violet-600', light: 'bg-violet-50' },
    blue: { name: 'blue', bg: 'bg-blue-600', text: 'text-blue-600', ring: 'ring-blue-600', light: 'bg-blue-50' },
    emerald: { name: 'emerald', bg: 'bg-emerald-600', text: 'text-emerald-600', ring: 'ring-emerald-600', light: 'bg-emerald-50' },
    rose: { name: 'rose', bg: 'bg-rose-600', text: 'text-rose-600', ring: 'ring-rose-600', light: 'bg-rose-50' },
    amber: { name: 'amber', bg: 'bg-amber-600', text: 'text-amber-600', ring: 'ring-amber-600', light: 'bg-amber-50' },
  };
  const currentTheme = themes[themeName];

  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      if (themeMode === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = themeMode === 'dark';
      }
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themeMode === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  // --- Helpers ---
  const getCategory = (id) => categories.find(c => c.id === id) || categories[0];

  const calculateTaskPoints = (task) => {
    const required = task.basePoints + (task.checklist || []).reduce((acc, item) => !item.optional ? acc + item.points : acc, 0);
    const bonus = (task.checklist || []).reduce((acc, item) => item.optional ? acc + item.points : acc, 0);
    return { required, bonus, totalPossible: required + bonus };
  };

  // --- Actions ---
  const handlePurchase = async (cost) => {
    if (currentPoints >= cost) {
      // Deduct points from Firestore
      await updateDoc(doc(db, "households", userProfile.householdId, "members", currentUser.uid), {
        points: increment(-cost)
      });
    }
  };

  const handleSaveCategory = (categoryData) => {
    setCategories([...categories, categoryData]);
  };

  const handleDeleteCategory = (id) => {
    if (categories.length > 1) setCategories(categories.filter(c => c.id !== id));
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (modalData) {
        // Edit
        await updateDoc(doc(db, "households", userProfile.householdId, "tasks", taskData.id), taskData);
      } else {
        // Create
        await addDoc(collection(db, "households", userProfile.householdId, "tasks"), {
          ...taskData,
          completed: false,
          createdAt: serverTimestamp(),
          createdBy: currentUser.uid
        });
      }
    } catch (e) {
      console.error("Error saving task:", e);
    }
  };

  const handleDeleteTask = async (id) => {
    await deleteDoc(doc(db, "households", userProfile.householdId, "tasks", id));
  };

  const handleCompleteTask = async ({ task, photo, earnedPoints }) => {
    try {
      // Mark task complete
      await updateDoc(doc(db, "households", userProfile.householdId, "tasks", task.id), {
        completed: true,
        earnedPoints,
        completionPhoto: photo,
        completedBy: currentUser.uid,
        completedAt: serverTimestamp()
      });

      // Add points to user
      await updateDoc(doc(db, "households", userProfile.householdId, "members", currentUser.uid), {
        points: increment(earnedPoints)
      });

      setModals({ ...modals, complete: false });
    } catch (e) {
      console.error("Error completing task:", e);
    }
  };

  const handleUpdateProfile = async (updates) => {
    // Update Auth Profile for displayName/Photo
    // And update Firestore Member
    // For now just update Member
    await updateDoc(doc(db, "households", userProfile.householdId, "members", currentUser.uid), updates);
  };









  if (!currentUser) {
    return <LoginScreen />;
  }

  if (!userProfile?.householdId) {
    return <HouseholdSetup />;
  }

  return (
    <div className={`h-full ${darkMode ? 'dark' : ''}`}>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 font-sans selection:${currentTheme.bg} selection:text-white`}>
        <main className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-white dark:bg-gray-900 overflow-hidden pt-safe pb-safe pb-24">

          <div className="h-screen overflow-y-auto scrollbar-hide pb-20">
            {activeTab === 'home' && (
              <div className="space-y-8 pb-32 animate-in fade-in duration-500">
                {/* Header */}
                <div className="relative pt-6 px-2">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                        <Calendar size={14} />
                        {currentDate}
                      </div>
                      <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight">
                        Hello, <span className={`${currentTheme.text}`}>{profile.name}.</span>
                      </h1>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${currentTheme.bg} flex items-center justify-center text-white font-bold shadow-lg shadow-gray-200 dark:shadow-none`}>
                      <Trophy size={20} />
                    </div>
                  </div>

                  {/* Level Card */}
                  <div className="bg-gray-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-32 h-32 ${currentTheme.bg} blur-[60px] opacity-50`}></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium opacity-80">
                          {rewardSystem === 'leaderboard' ? 'Weekly Score' : 'Wallet Balance'}
                        </span>
                        <span className="text-2xl font-bold">{profile.points} <span className="text-sm font-normal opacity-70">pts</span></span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r from-white/80 to-white`} style={{ width: `${(profile.points % 1000) / 10}%` }}></div>
                      </div>
                      <p className="text-xs opacity-50 mt-2 text-right">
                        {(() => {
                          if (rewardSystem !== 'leaderboard') return `Next reward at ${Math.ceil((profile.points + 1) / 1000) * 1000}`;

                          const sorted = [...members].sort((a, b) => b.points - a.points);
                          const myRank = sorted.findIndex(u => u.id === currentUser.uid);
                          const me = sorted[myRank];

                          if (!me) return 'Welcome!';

                          if (myRank === 0) {
                            const runnerUp = sorted[1];
                            const diff = me.points - (runnerUp?.points || 0);
                            return `👑 Leading by ${diff} pts!`;
                          } else {
                            const ahead = sorted[myRank - 1];
                            const diff = ahead.points - me.points;
                            return `🔥 ${diff} pts behind ${ahead.name}`;
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Task List */}
                <div className="space-y-4 px-1">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      Today&apos;s Tasks
                      <span className="text-xs font-normal bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-500">{tasks.filter(t => !t.completed).length}</span>
                    </h2>
                  </div>

                  {tasks.map(task => {
                    const category = getCategory(task.categoryId);
                    const points = calculateTaskPoints(task);

                    return (
                      <SwipeableTaskCard key={task.id}
                        onClick={() => {
                          setModalData(task);
                          setModals({ ...modals, complete: true });
                        }}
                        onEdit={() => {
                          setModalData(task);
                          setModals({ ...modals, create: true });
                        }}
                        onDelete={() => handleDeleteTask(task.id)}
                        theme={currentTheme}
                        isCompleted={task.completed}
                      >
                        <div className={`p-4 flex items-start gap-4 ${task.completed ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                          <div className="pt-1">
                            {task.completed ? (
                              <div className={`rounded-full p-1 ${currentTheme.bg} text-white`}>
                                <Check size={16} strokeWidth={3} />
                              </div>
                            ) : (
                              <div className={`w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 ${currentTheme.text} transition-colors`}>
                                <CategoryIcon iconKey={category.iconKey} size={20} />
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className={`font-semibold text-[17px] ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800 dark:text-gray-100'}`}>
                                {task.title}
                              </h3>
                              <div className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md flex items-center gap-1">
                                <Trophy size={10} />
                                {task.completed ? task.earnedPoints : points.required}
                                {!task.completed && points.bonus > 0 && <span className="text-[10px] opacity-70">+{points.bonus}</span>}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-700">
                                {category.name}
                              </span>
                              {task.checklist && task.checklist.length > 0 && (
                                <span className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md flex items-center gap-1">
                                  <ListChecks size={12} /> {task.checklist.length} steps
                                </span>
                              )}
                              {task.requirePhoto && (
                                <span className="text-xs text-purple-500 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-md flex items-center gap-1">
                                  <Camera size={12} /> Proof
                                </span>
                              )}
                            </div>
                          </div>

                          {!task.completed && (
                            <div className="self-center p-2 text-gray-300 dark:text-gray-600">
                              <ChevronRight size={16} className="opacity-50" />
                            </div>
                          )}
                        </div>
                      </SwipeableTaskCard>
                    );
                  })}
                </div>
              </div>
            )}
            {activeTab === 'rewards' && (
              <div className="space-y-6 pb-32 animate-in fade-in duration-500">
                <div className="pt-6 px-4">
                  <h2 className="text-2xl font-bold dark:text-white mb-1">
                    {rewardSystem === 'leaderboard' ? 'Weekly Winner' : 'Point Shop'}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {rewardSystem === 'leaderboard' ? 'Who is leading the household?' : 'Spend your points on treats!'}
                  </p>
                </div>

                {rewardSystem === 'leaderboard' ? (
                  <div className="px-4 space-y-4">
                    {[...members].sort((a, b) => b.points - a.points).map((u, idx, arr) => {
                      const isUser = u.id === currentUser.uid;
                      return (
                        <Card key={u.id} className={`p-4 flex items-center gap-4 relative overflow-hidden ${idx === 0 ? `border-2 border-${currentTheme.name}-400` : ''}`}>
                          <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full flex-shrink-0 ${idx === 0 ? 'bg-amber-400 text-white shadow-lg' : idx === 1 ? 'bg-gray-300 text-gray-600' : idx === 2 ? 'bg-orange-300 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                            {idx === 0 ? <Crown size={16} /> : idx + 1}
                          </div>

                          <div className="flex-shrink-0">
                            {u.image ? (
                              <img src={u.image} alt={u.name} className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 shadow-sm">
                                <CategoryIcon iconKey={u.avatar} size={24} />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 z-10 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <h3 className={`font-bold truncate pr-2 ${isUser ? currentTheme.text : 'dark:text-white'}`}>
                                {u.name} {isUser && '(You)'}
                              </h3>
                              <span className="font-bold text-gray-800 dark:text-gray-200">{u.points} pts</span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className={`h-full ${isUser ? currentTheme.bg : 'bg-gray-400'}`} style={{ width: `${(u.points / (arr[0].points || 1)) * 100}%` }}></div>
                            </div>
                          </div>

                          {idx === 0 && <div className={`absolute inset-0 bg-amber-50 dark:bg-amber-900/10 opacity-50 pointer-events-none`}></div>}
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-4 grid grid-cols-2 gap-3">
                    <div className={`col-span-2 p-4 rounded-2xl ${currentTheme.bg} text-white shadow-lg mb-2 flex justify-between items-center`}>
                      <span className="font-medium opacity-90">Your Balance</span>
                      <span className="font-bold text-2xl">{profile.points} pts</span>
                    </div>
                    {MOCK_REWARDS.map(reward => (
                      <Card key={reward.id} className="p-4 flex flex-col items-center text-center gap-3">
                        <div className="mb-2 text-amber-500">
                          <CategoryIcon iconKey={reward.icon} size={40} />
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-white leading-tight">{reward.title}</h3>
                        <Button fullWidth onClick={() => handlePurchase(reward.cost)} disabled={profile.points < reward.cost} themeColor={currentTheme} className="py-2 text-xs">
                          {reward.cost} pts
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'profile' && (
              <div className="pt-10 pb-32 space-y-6 text-center animate-in slide-in-from-right duration-300 px-5">
                <div className="relative inline-block group">
                  {profile.avatarType === 'image' && profile.image ? (
                    <img src={profile.image} className={`w-28 h-28 rounded-full object-cover ring-4 ring-offset-4 dark:ring-offset-gray-900 ${currentTheme.ring}`} />
                  ) : (
                    <div className={`w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-gray-400 shadow-xl ring-4 ring-offset-4 dark:ring-offset-gray-900 ${currentTheme.ring}`}>
                      <CategoryIcon iconKey={profile.avatar} size={48} />
                    </div>
                  )}
                  <button onClick={() => setIsEditingProfile(!isEditingProfile)} className={`absolute bottom-0 right-0 p-2.5 rounded-full shadow-lg text-white hover:scale-110 transition-transform ${currentTheme.bg}`}>
                    <Edit3 size={16} />
                  </button>
                </div>

                {isEditingProfile ? (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Edit Identity</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 text-left">Display Name</label>
                        <input value={profile.name} onChange={(e) => handleUpdateProfile({ name: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-gray-900 p-3 rounded-xl font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-opacity-50"
                          style={{ '--tw-ring-color': currentTheme.bg }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2 text-left">Choose Avatar</label>
                        <div className="grid grid-cols-5 gap-2">
                          {AVATAR_PRESETS.map(iconKey => (
                            <button key={iconKey} onClick={() => {
                              setProfile({ ...profile, avatar: iconKey, avatarType: 'emoji' });
                              if (navigator.vibrate) navigator.vibrate(10);
                            }}
                              className={`aspect-square rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${profile.avatar === iconKey && profile.avatarType === 'emoji' ? 'bg-gray-100 dark:bg-gray-700 ring-2 ring-inset text-violet-600 ' + currentTheme.ring : ''}`}
                            >
                              <CategoryIcon iconKey={iconKey} size={24} />
                            </button>
                          ))}
                        </div>
                        <div className="mt-3">
                          <button onClick={() => fileInputRef.current.click()} className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Camera size={16} /> Upload Photo
                          </button>
                          <input type="file" ref={fileInputRef} onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) setProfile({ ...profile, avatarType: 'image', image: URL.createObjectURL(file) });
                          }} hidden accept="image/*" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2 text-left">App Theme</label>
                        <div className="flex gap-2 justify-between">
                          {Object.values(themes).map(t => (
                            <button key={t.name} onClick={() => setThemeName(t.name)} className={`w-10 h-10 rounded-full ${t.bg} ring-2 ring-offset-2 dark:ring-offset-gray-900 transition-all ${themeName === t.name ? 'ring-gray-400 scale-110' : 'ring-transparent opacity-70 hover:opacity-100'}`} />
                          ))}
                        </div>
                      </div>
                      <Button fullWidth onClick={() => setIsEditingProfile(false)} themeColor={currentTheme}>Done</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
                    <p className="text-gray-500">Household Keeper</p>
                  </div>
                )}

                {/* STATISTICS */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-left ml-1">Statistics</h3>
                  <div className="grid grid-cols-3 gap-3 text-left">
                    <Card className="p-3 flex flex-col gap-2">
                      <div className={`w-8 h-8 rounded-lg ${currentTheme.light} flex items-center justify-center ${currentTheme.text}`}>
                        <CheckCircle2 size={18} />
                      </div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Tasks Done</span>
                      <span className="text-lg font-bold dark:text-white">{profile.tasksCompleted}</span>
                    </Card>
                    <Card className="p-3 flex flex-col gap-2">
                      <div className={`w-8 h-8 rounded-lg ${currentTheme.light} flex items-center justify-center ${currentTheme.text}`}>
                        <TrendingUp size={18} />
                      </div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Streak</span>
                      <span className="text-lg font-bold dark:text-white">{profile.streak} <span className="text-xs font-normal text-gray-400">days</span></span>
                    </Card>
                    <Card className="p-3 flex flex-col gap-2">
                      <div className={`w-8 h-8 rounded-lg ${currentTheme.light} flex items-center justify-center ${currentTheme.text}`}>
                        <Activity size={18} />
                      </div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Activity</span>
                      <span className="text-lg font-bold dark:text-white">High</span>
                    </Card>
                  </div>
                </div>

                {/* SYSTEM SETTINGS */}
                <div className="space-y-4 pt-4 text-left">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Household Settings</h3>
                  <Card className="divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <Shield size={18} className="text-gray-600 dark:text-gray-300" />
                        </div>
                        <div>
                          <span className="font-medium dark:text-gray-200 block">Admin Privileges</span>
                          <span className="text-xs text-gray-500">Toggle to view as member</span>
                        </div>
                      </div>
                      <Switch checked={isAdmin} onChange={() => setIsAdmin(!isAdmin)} themeColor={currentTheme} />
                    </div>

                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <Sun size={18} className="text-gray-600 dark:text-gray-300" />
                        </div>
                        <span className="font-medium dark:text-gray-200">App Theme</span>
                      </div>
                      <select
                        value={themeMode}
                        onChange={(e) => setThemeMode(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-800 dark:text-white text-sm font-bold py-2 px-3 rounded-xl border-none focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer"
                      >
                        <option value="system">System Default</option>
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                      </select>
                    </div>

                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <Sparkles size={18} className="text-gray-600 dark:text-gray-300" />
                        </div>
                        <span className="font-medium dark:text-gray-200">Accent Color</span>
                      </div>
                      <div className="flex gap-3 pl-11 overflow-x-auto pb-2 scrollbar-hide">
                        {Object.values(themes).map(t => (
                          <button
                            key={t.name}
                            onClick={() => setThemeName(t.name)}
                            className={`w-9 h-9 rounded-full ${t.bg} ring-2 ring-offset-2 dark:ring-offset-gray-900 transition-all ${themeName === t.name ? 'ring-gray-400 scale-110' : 'ring-transparent opacity-70 hover:opacity-100'}`}
                            aria-label={`Select ${t.name} theme`}
                          />
                        ))}
                      </div>
                    </div>

                    {isAdmin && (
                      <>
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                              <Crown size={18} className="text-gray-600 dark:text-gray-300" />
                            </div>
                            <div>
                              <span className="font-medium dark:text-gray-200 block">Weekly Winner Mode</span>
                              <span className="text-xs text-gray-500">Enable leaderboard competition</span>
                            </div>
                          </div>
                          <Switch checked={rewardSystem === 'leaderboard'} onChange={() => setRewardSystem(rewardSystem === 'leaderboard' ? 'shop' : 'leaderboard')} themeColor={currentTheme} />
                        </div>

                        <button onClick={() => setModals({ ...modals, categoryManager: true })} className="w-full p-4 flex justify-between items-center text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                              <Layers size={18} className="text-gray-600 dark:text-gray-300" />
                            </div>
                            <span className="font-medium dark:text-gray-200">Manage Categories</span>
                          </div>
                          <ChevronRight size={18} className="text-gray-400" />
                        </button>
                      </>
                    )}
                  </Card>
                </div>
              </div>
            )}
          </div>

          {/* FAB */}
          {activeTab === 'home' && (
            <div className="absolute bottom-24 right-6 z-10">
              <button
                aria-label="Add Task"
                onClick={() => { setModalData(null); setModals({ ...modals, create: true }); }}
                className={`w-16 h-16 rounded-full ${currentTheme.bg} text-white shadow-xl shadow-gray-400/40 dark:shadow-black/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-all`}
              >
                <Plus size={32} />
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 pb-safe z-40">
            <div className="flex justify-around items-center h-20">
              <button
                aria-label="Home"
                onClick={() => setActiveTab('home')}
                className={`p-2 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-gray-100 dark:bg-gray-800 ' + currentTheme.text : 'text-gray-400'}`}
              >
                <Home size={28} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
              </button>
              <button
                aria-label="Rewards"
                onClick={() => setActiveTab('rewards')}
                className={`p-2 rounded-2xl transition-all ${activeTab === 'rewards' ? 'bg-gray-100 dark:bg-gray-800 ' + currentTheme.text : 'text-gray-400'}`}
              >
                <ShoppingBag size={28} strokeWidth={activeTab === 'rewards' ? 2.5 : 2} />
              </button>
              <button
                aria-label="Profile"
                onClick={() => setActiveTab('profile')}
                className={`p-2 rounded-2xl transition-all ${activeTab === 'profile' ? 'bg-gray-100 dark:bg-gray-800 ' + currentTheme.text : 'text-gray-400'}`}
              >
                <User size={28} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
              </button>
            </div>
          </nav>

          {/* Modals */}
          <CreateTaskModal
            key={modals.create ? `create-${modalData?.id || 'new'}` : 'create-closed'}
            isOpen={modals.create}
            onClose={() => setModals({ ...modals, create: false })}
            onSave={handleSaveTask}
            categories={categories}
            initialData={modalData}
            theme={currentTheme}
          />
          <CompleteTaskModal
            key={modals.complete ? `complete-${modalData?.id || 'none'}` : 'complete-closed'}
            isOpen={modals.complete}
            onClose={() => setModals({ ...modals, complete: false })}
            onComplete={handleCompleteTask}
            task={modalData}
            theme={currentTheme}
          />
          <CategoryManagerModal
            isOpen={modals.categoryManager}
            onClose={() => setModals({ ...modals, categoryManager: false })}
            categories={categories}
            onAddCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
            theme={currentTheme}
          />

        </main>
      </div>
    </div>
  );
}
