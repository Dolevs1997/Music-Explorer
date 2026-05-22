import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import * as admin from "firebase-admin";

import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file
const URL = process.env.CLIENT_URL || "http://localhost:5173/moodiify/login";
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
const actionCodeSettings = {
  // URL you want to redirect back to. The domain must be in the
  // authorized domains list in the Firebase Console.
  url: URL,
  handleCodeInApp: true,
  iOS: {
    bundleId: "com.example.ios",
  },
  android: {
    packageName: "com.example.android",
    installApp: true,
    minimumVersion: "12",
  },
};
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Initialize Firestore if needed
export const auth = getAuth(app); // Initialize Firebase Auth if needed

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export { admin, actionCodeSettings };
