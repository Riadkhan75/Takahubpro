import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB9t6ztUCfv_Rx-cNRjQE8dnShNZg2FaCQ",
  authDomain: "rkkhan-67ac1.firebaseapp.com",
  databaseURL: "https://rkkhan-67ac1-default-rtdb.firebaseio.com",
  projectId: "rkkhan-67ac1",
  storageBucket: "rkkhan-67ac1.firebasestorage.app",
  messagingSenderId: "1080011640502",
  appId: "1:1080011640502:web:a2970eaae2267df290e017",
  measurementId: "G-CC7LH7LFHD"
};

const novaFirebaseConfig = {
  apiKey: "AIzaSyB9t6ztUCfv_Rx-cNRjQE8dnShNZg2FaCQ",
  authDomain: "rkkhan-67ac1.firebaseapp.com",
  databaseURL: "https://rkkhan-67ac1-default-rtdb.firebaseio.com",
  projectId: "rkkhan-67ac1",
  storageBucket: "rkkhan-67ac1.firebasestorage.app",
  messagingSenderId: "1080011640502",
  appId: "1:1080011640502:web:a2970eaae2267df290e017",
  measurementId: "G-CC7LH7LFHD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

const novaApp = initializeApp(novaFirebaseConfig, "novaApp");
export const novaAuth = getAuth(novaApp);
export const novaDb = getFirestore(novaApp);
