// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBAYl3bCQahYdkrlEoCjEESRrpcxYhk8e4",
  authDomain: "blaze-signal-c21b2.firebaseapp.com",
  projectId: "blaze-signal-c21b2",
  storageBucket: "blaze-signal-c21b2.firebasestorage.app",
  messagingSenderId: "597323065496",
  appId: "1:597323065496:web:7c720d62d4d365b06e48ed",
  measurementId: "G-393K6XS3W0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };