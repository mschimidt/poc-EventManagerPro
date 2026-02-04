import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// REPLACE WITH YOUR ACTUAL FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDummyKey",
  authDomain: "dummy-project.firebaseapp.com",
  projectId: "dummy-project",
  storageBucket: "dummy-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);