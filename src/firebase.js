// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBREGdlm8ITWtg-MijiCpW4kdVyeU5VSQs",
  authDomain: "nobodeal-a97a0.firebaseapp.com",
  projectId: "nobodeal-a97a0",
  storageBucket: "nobodeal-a97a0.firebasestorage.app",
  messagingSenderId: "141917334760",
  appId: "1:141917334760:web:962c18006e04d7057aed5d",
  measurementId: "G-9481YVGL48"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);