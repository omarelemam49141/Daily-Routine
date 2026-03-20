import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

export type FirebaseClients = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  messaging: Messaging | null;
};

function readConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
  if (!config.apiKey || !config.projectId) return null;
  return config;
}

let cached: FirebaseClients | null | undefined;

export async function getFirebase(): Promise<FirebaseClients | null> {
  if (cached !== undefined) return cached;
  const config = readConfig();
  if (!config) {
    cached = null;
    return null;
  }
  const app = getApps().length ? getApps()[0]! : initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  let messaging: Messaging | null = null;
  if (typeof window !== "undefined" && (await isSupported())) {
    try {
      messaging = getMessaging(app);
    } catch {
      messaging = null;
    }
  }
  cached = { app, auth, db, messaging };
  return cached;
}

export async function ensureAnonymousUser(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const fb = await getFirebase();
  if (!fb) return null;
  const { auth } = fb;
  if (auth.currentUser) return auth.currentUser.uid;
  const cred = await signInAnonymously(auth);
  return cred.user.uid;
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const fb = await getFirebase();
  if (!fb) throw new Error("Firebase not configured");
  await signInWithEmailAndPassword(fb.auth, email.trim(), password);
}

export async function signOutUser(): Promise<void> {
  const fb = await getFirebase();
  if (!fb) return;
  await signOut(fb.auth);
}

export async function sendPasswordReset(email: string): Promise<void> {
  const fb = await getFirebase();
  if (!fb) throw new Error("Firebase not configured");
  await sendPasswordResetEmail(fb.auth, email.trim());
}
