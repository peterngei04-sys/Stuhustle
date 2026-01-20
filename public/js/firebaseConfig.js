// public/js/firebaseConfig.js
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4MGAOgctHWO9suB5xCTJ3U4ASktJQa8c",
  authDomain: "stuhustle-c8d4d.firebaseapp.com",
  projectId: "stuhustle-c8d4d",
  storageBucket: "stuhustle-c8d4d.firebasestorage.app",
  messagingSenderId: "285691240314",
  appId: "1:285691240314:web:6eb01eec2d44dacd7000c3",
  measurementId: "G-28WNND45QX"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
