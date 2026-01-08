import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyC4uV4pCrt9vQeqtvGG227E7t9eGNtH54o",
  authDomain: "couch-trivia.firebaseapp.com",
  databaseURL: "https://couch-trivia-default-rtdb.firebaseio.com",
  projectId: "couch-trivia",
  storageBucket: "couch-trivia.firebasestorage.app",
  messagingSenderId: "652976708234",
  appId: "1:652976708234:web:8d835b5fcad27847cd6b73",
  measurementId: "G-MENG9YVXV3"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);