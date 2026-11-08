/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App safely (singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Critical: Firestore Database ID mapping per project configuration
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Google Auth Provider configured for modern web popup sign-in
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export interface AuthResponse {
  user: FirebaseUser | null;
  error?: string;
}

/**
 * Sign in with Google using a popup flow.
 * Recommended for web apps in iframe / sandbox environments.
 */
export async function signInWithGoogle(): Promise<AuthResponse> {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    return {
      user: credential.user
    };
  } catch (error: unknown) {
    const authErr = error as AuthError;
    let friendlyMessage = 'تعذر تسجيل الدخول باستخدام حساب Google. يرجى المحاولة مرة أخرى.';
    
    if (authErr.code === 'auth/popup-closed-by-user') {
      friendlyMessage = 'تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.';
    } else if (authErr.code === 'auth/cancelled-popup-request') {
      friendlyMessage = 'تم إلغاء طلب تسجيل الدخول.';
    } else if (authErr.code === 'auth/unauthorized-domain') {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
      friendlyMessage = `auth/unauthorized-domain: النطاق (${hostname}) غير مصرح به في Firebase Console. يرجى إضافته إلى Authorized Domains في مشروع yachty-exchanger-fm4ph.`;
    } else if (authErr.code === 'auth/network-request-failed') {
      friendlyMessage = 'تعذر الاتصال بالشبكة، يرجى التحقق من اتصالك بالإنترنت.';
    } else if (authErr.message) {
      friendlyMessage = authErr.message;
    }

    console.warn('Google Sign-In Error:', authErr.code, authErr.message);
    return {
      user: null,
      error: friendlyMessage
    };
  }
}

/**
 * Sign out current authenticated user.
 */
export async function signOutUser(): Promise<{ success: boolean; error?: string }> {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: unknown) {
    const authErr = error as AuthError;
    return {
      success: false,
      error: authErr.message || 'حدث خطأ أثناء تسجيل الخروج.'
    };
  }
}

/**
 * Listen to Firebase Authentication state changes.
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Retrieve currently signed-in Firebase user, if any.
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

export type { FirebaseUser };
