import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAptzeuouzN1US04-TyKJhEP9rcVWp8VjU",
    authDomain: "harmony-chore-app-scotty.firebaseapp.com",
    projectId: "harmony-chore-app-scotty",
    storageBucket: "harmony-chore-app-scotty.firebasestorage.app",
    messagingSenderId: "700549416973",
    appId: "1:700549416973:web:e8c217fa2d9aeeca49ed44"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
