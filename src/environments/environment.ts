// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  mockDB: true,
  firebase: {
    apiKey: import.meta.env.NG_APP_FIREBASE_DEV_API_KEY,
    // REPLACE WITH CONFIG
  },
};

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.API_KEY_DEV_FIREBASE,
  authDomain: "team-a2-skill-building.firebaseapp.com",
  projectId: "team-a2-skill-building",
  storageBucket: "team-a2-skill-building.firebasestorage.app",
  messagingSenderId: "726587850875",
  appId: "1:726587850875:web:676d80d0e6de0277b1e2de",
  measurementId: "G-HML2P05NGG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);