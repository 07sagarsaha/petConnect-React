// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCAkwUSmrB8mO6K_SzDde1_Zjy1pKzKvSs",
  authDomain: "pet-connect-01.firebaseapp.com",
  projectId: "pet-connect-01",
  storageBucket: "pet-connect-01.appspot.com",
  messagingSenderId: "107924468638",
  appId: "1:107924468638:web:c7158a902b81f086ae5c8f",
  measurementId: "G-ENKG0FJETY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, collection };
