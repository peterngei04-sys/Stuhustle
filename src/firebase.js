import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4MGAOgctHWO9suB5xCTJ3U4ASktJQa8c",
  authDomain: "stuhustle-c8d4d.firebaseapp.com",
  projectId: "stuhustle-c8d4d",
  storageBucket: "stuhustle-c8d4d.firebasestorage.app",
  messagingSenderId: "285691240314",
  appId: "1:285691240314:web:6eb01eec2d44dacd7000c3",
  measurementId: "G-28WNND45QX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
