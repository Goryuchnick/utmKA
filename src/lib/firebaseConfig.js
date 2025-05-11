// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgsVpiHDHUIKxiSYoC0nwsDxJd1yd-U20",
  authDomain: "utm-hero-vcd0j.firebaseapp.com",
  databaseURL: "https://utm-hero-vcd0j-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "utm-hero-vcd0j",
  storageBucket: "utm-hero-vcd0j.firebasestorage.app",
  messagingSenderId: "623965285755",
  appId: "1:623965285755:web:301df47c5943a4a832e1de"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const auth = getAuth(app);

export { db, auth };