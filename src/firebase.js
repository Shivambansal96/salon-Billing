// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

const app = initializeApp(firebaseConfig);

// ✅ MUST export db
export const db = getFirestore(app);


// // src/firebase.js
// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';

// const firebaseConfig = {
//     apiKey: "AIzaSyC5hTEnbxVEgNA2sznaHD3UrGVVblYaMws",
//     authDomain: "gl-salon-billing.firebaseapp.com",
//     projectId: "gl-salon-billing",
//     storageBucket: "gl-salon-billing.firebasestorage.app",
//     messagingSenderId: "500849833588",
//     appId: "1:500849833588:web:6a3f8b78ca568053f60321",
//     measurementId: "G-NYT967B2ES"
// };
// const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);
