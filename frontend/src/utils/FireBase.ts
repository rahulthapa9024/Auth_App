import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGE_SENDING_ID,
  appId: import.meta.env.VITE_APP_ID,
};

const FireBaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(FireBaseApp);

export const googleProvider = new GoogleAuthProvider();

export default FireBaseApp;