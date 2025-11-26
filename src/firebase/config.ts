import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Replace with YOUR config from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyC8ER0maZC0P3GKu3lu41wpJ74t_PfaP3A",
    authDomain: "thunderstack-2d0bc.firebaseapp.com",
    databaseURL: "https://thunderstack-2d0bc-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "thunderstack-2d0bc",
    storageBucket: "thunderstack-2d0bc.firebasestorage.app",
    messagingSenderId: "610027581896",
    appId: "1:610027581896:web:626f92cb375070cde010fd"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Sign in anonymously on app load
export const initializeAuth = async () => {
  try {
    const result = await signInAnonymously(auth);
    console.log('Signed in anonymously:', result.user.uid);
    return result.user;
  } catch (error) {
    console.error('Anonymous sign-in failed:', error);
    throw error;
  }
};
