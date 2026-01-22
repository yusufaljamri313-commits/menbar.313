"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, onSnapshot, updateDoc, arrayUnion, increment } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // مراقبة حالة تسجيل الدخول وتغيرات قاعدة البيانات
    useEffect(() => {
        let unsubDb = null;
        const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userRef = doc(db, "users", currentUser.uid);
                unsubDb = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        const initialData = {
                            name: currentUser.displayName || 'مستخدم جديد',
                            email: currentUser.email,
                            credits: 10,
                            history: [],
                            joinedAt: new Date().toISOString()
                        };
                        setDoc(userRef, initialData).catch(e => console.error("Firestore Error:", e));
                        setUserData(initialData);
                    }
                    setLoading(false);
                }, (err) => {
                    console.error("Firestore Snapshot Error:", err);
                    setUserData({ name: currentUser.displayName, email: currentUser.email, credits: 10, history: [] });
                    setLoading(false);
                });
            } else {
                if (unsubDb) unsubDb();
                setUser(prev => prev?.isMock ? prev : null);
                setUserData(prev => prev?.isMock ? prev : null);
                setLoading(false);
            }
        });

        return () => {
            unsubAuth();
            if (unsubDb) unsubDb();
        };
    }, []);

    // --- MOCK HELPERS ---
    const setMockUser = (email, name = 'مستخدم تجريبي') => {
        const mockU = { uid: 'mock_' + Date.now(), email, displayName: name, isMock: true };
        const mockD = { name, email, credits: 50, history: [], isMock: true }; // 50 credits enabling tool usage
        setUser(mockU);
        setUserData(mockD);
        setLoading(false);
    };

    // تسجيل الدخول بجوجل
    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("خطأ تسجيل الدخول بجوجل (Using Mock Fallback):", error);
            // Fallback to Mock
            setMockUser('google-guest@example.com', 'Google User');
        }
    };

    // إنشاء حساب جديد
    const register = async (name, email, password) => {
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", res.user.uid), {
                name: name, email: email, credits: 10, history: [], joinedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Register Error (Using Mock Fallback):", error);
            setMockUser(email, name);
        }
    };

    // تسجيل دخول
    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Login Error (Using Mock Fallback):", error);
            // Fallback for any error (User not found, wrong password, or network)
            // This satisfies "Even if fake account, let me login"
            setMockUser(email);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (e) { }
        setUser(null);
        setUserData(null);
    };

    // إضافة رصيد
    const addCredits = async (amount) => {
        if (!user) return;

        // Mock handling
        if (userData?.isMock) {
            setUserData(prev => ({ ...prev, credits: (prev.credits || 0) + amount }));
            return;
        }

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { credits: increment(amount) });
        } catch (e) {
            // Fallback local update
            setUserData(prev => ({ ...prev, credits: (prev.credits || 0) + amount }));
        }
    };

    // خصم رصيد
    const deductCredits = async (amount) => {
        if (!user || !userData) return false;
        if ((userData.credits || 0) < amount) return false;

        // Mock handling
        if (userData?.isMock) {
            setUserData(prev => ({ ...prev, credits: prev.credits - amount }));
            return true;
        }

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { credits: increment(-amount) });
            return true;
        } catch (e) {
            console.error("Deduct Credits Error:", e);
            // Fallback allow if error
            setUserData(prev => ({ ...prev, credits: prev.credits - amount }));
            return true;
        }
    };

    const addHistoryItem = async (item) => {
        if (!user) return;

        if (userData?.isMock) {
            setUserData(prev => ({ ...prev, history: [...(prev.history || []), item] }));
            return;
        }

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { history: arrayUnion(item) });
        } catch (e) {
            setUserData(prev => ({ ...prev, history: [...(prev.history || []), item] }));
        }
    };

    const combinedUser = user ? { ...user, ...userData } : null;

    return (
        <AuthContext.Provider value={{
            user: combinedUser,
            loading,
            login, register, loginWithGoogle, logout,
            addCredits, deductCredits, addHistoryItem
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
