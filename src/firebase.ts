import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyALeR2P2e4R9Mal-yWy0QbwuO8SaX5_wDc",
  authDomain: "dimitritrizah.firebaseapp.com",
  projectId: "dimitritrizah",
  storageBucket: "dimitritrizah.firebasestorage.app",
  messagingSenderId: "359123557428",
  appId: "1:359123557428:web:9bf6a27e3eea3b92e3be61"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
