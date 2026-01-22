// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBvHtlhQVZxS1WZh1ZO8AygYLteS4t8jbw",
    authDomain: "lmmax-21e96.firebaseapp.com",
    projectId: "lmmax-21e96",
    storageBucket: "lmmax-21e96.firebasestorage.app",
    messagingSenderId: "75890617380",
    appId: "1:75890617380:web:80a3eea84c9374b551bcb1",
    measurementId: "G-RY169VNGCM"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
