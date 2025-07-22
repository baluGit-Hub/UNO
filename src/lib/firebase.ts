
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "card-party-huif0",
  appId: "1:956824613656:web:209b480621f0bcc601a46d",
  storageBucket: "card-party-huif0.firebasestorage.app",
  apiKey: "AIzaSyB5_z3elB0EMtRKKp07ZT6AP2-SW9KAAcw",
  authDomain: "card-party-huif0.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "956824613656",
  databaseURL: "https://card-party-huif0-default-rtdb.firebaseio.com",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
