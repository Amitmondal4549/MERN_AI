import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAHbGPfx1TZmvAtEJvNVROGt4LD8VzWIm4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mernai-c9f18.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mernai-c9f18",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mernai-c9f18.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "13032351628",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:13032351628:web:914638694ecff039cb18a9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-Q81EGJDH56"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider};
