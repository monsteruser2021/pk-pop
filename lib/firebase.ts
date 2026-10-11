// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBI2BlKRI111N-Oi6G6gfxNSW4aO1ezTI8",
  authDomain: "pk-pop-838ac.firebaseapp.com",
  projectId: "pk-pop-838ac",
  storageBucket: "pk-pop-838ac.firebasestorage.app",
  messagingSenderId: "26239776380",
  appId: "1:26239776380:web:b3342f073e56e11514fbf9",
  measurementId: "G-SQ2X7LBC1W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);