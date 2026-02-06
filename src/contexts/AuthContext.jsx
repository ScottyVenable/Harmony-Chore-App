import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null); // Firestore profile
    const [loading, setLoading] = useState(true);

    async function signup(email, password, displayName, avatar = 'smile') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Create user document in Firestore
        await setDoc(doc(db, "users", result.user.uid), {
            email,
            displayName,
            avatar,
            isGuest: false,
            householdId: null,
            createdAt: serverTimestamp()
        });
        console.log("User profile created in Firestore");
        // Update Auth Profile
        await updateProfile(result.user, { displayName });
        return result;
    }

    async function signupAsGuest(password, displayName, avatar = 'smile') {
        // Generate a unique synthetic email for Firebase Auth (which requires one)
        const guestId = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
            : Math.random().toString(36).slice(2, 14);
        const syntheticEmail = `${guestId}@guest.harmony.app`;
        const result = await createUserWithEmailAndPassword(auth, syntheticEmail, password);
        // Create user document in Firestore marked as guest
        await setDoc(doc(db, "users", result.user.uid), {
            email: null,
            displayName,
            avatar,
            isGuest: true,
            householdId: null,
            createdAt: serverTimestamp()
        });
        console.log("Guest profile created in Firestore");
        // Update Auth Profile
        await updateProfile(result.user, { displayName });
        return result;
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    async function loginWithGoogle() {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user already has a profile
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            // Create user document in Firestore if it doesn't exist
            await setDoc(docRef, {
                email: user.email,
                displayName: user.displayName,
                avatar: 'smile',
                householdId: null,
                createdAt: serverTimestamp()
            });
            console.log("Google User profile created in Firestore");
        }
        return result;
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        let unsubProfile = () => { };

        const unsubAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);

            if (user) {
                // Subscribe to profile changes
                unsubProfile = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data());
                    } else {
                        setUserProfile(null);
                    }
                    setLoading(false);
                }, (err) => {
                    console.error("Profile sync error:", err);
                    setLoading(false);
                });
            } else {
                setUserProfile(null);
                unsubProfile();
                setLoading(false);
            }
        });

        return () => {
            unsubAuth();
            unsubProfile();
        };
    }, []);

    const value = {
        currentUser,
        userProfile,
        signup,
        signupAsGuest,
        login,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
