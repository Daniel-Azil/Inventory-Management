// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Corrected import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACBvJY3bEbCpSfrJsgh9WLz_BOcSj2szU",
  authDomain: "goods-tracker-ea9c6.firebaseapp.com",
  projectId: "goods-tracker-ea9c6",
  storageBucket: "goods-tracker-ea9c6.appspot.com",
  messagingSenderId: "279499855420",
  appId: "1:279499855420:web:c0ac28e70169adf3ac9539",
  measurementId: "G-1VY69J2W1M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export { app, firestore };
