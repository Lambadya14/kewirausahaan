// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDooCSw5OXT1SMFOQa9AtEMkAySva1Eezg",
  authDomain: "kewirausahaan-8fe3d.firebaseapp.com",
  projectId: "kewirausahaan-8fe3d",
  storageBucket: "kewirausahaan-8fe3d.appspot.com",
  messagingSenderId: "48995248517",
  appId: "1:48995248517:web:ec9411487d0ba665d17cec",
  measurementId: "G-NCKETL64C3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore();
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, analytics, database, storage };
