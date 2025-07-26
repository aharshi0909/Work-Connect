import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as firebaseAuth from 'firebase/auth';
const firebaseConfig = {
  // Use yours
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;

let auth:any;
try {
  auth = initializeAuth(app, {
    persistence: reactNativePersistence(AsyncStorage)
  });
} catch (error) {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
