import { initializeApp } from 'firebase/app';

import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  confirmPasswordReset,
  verifyPasswordResetCode
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA39JbSKdsCoy1Ld5AjSOTTcgvADcaYkE0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "coursewhiz-f7dc8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "coursewhiz-f7dc8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "coursewhiz-f7dc8.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "664403358185",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:664403358185:web:2ff59a72bbb88879231b78"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Email/Password Authentication
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  confirmPasswordReset,
  verifyPasswordResetCode
};

// Phone OTP Authentication
export const setupRecaptcha = (containerId) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA verified');
      }
    });
  }
};

export const requestFirebaseOTP = async (phoneNumber) => {
  setupRecaptcha('recaptcha-container');

  const appVerifier = window.recaptchaVerifier;

  const confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    appVerifier
  );

  return confirmationResult;
};