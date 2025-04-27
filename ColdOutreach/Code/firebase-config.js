// Firebase Configuration for OutreachAI
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your Firebase API Key
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // Replace with your Firebase Auth Domain
  projectId: "YOUR_PROJECT_ID", // Replace with your Firebase Project ID
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // Replace with your Firebase Storage Bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your Firebase Messaging Sender ID
  appId: "YOUR_APP_ID", // Replace with your Firebase App ID
  measurementId: "YOUR_MEASUREMENT_ID" // Optional, replace with your Firebase Measurement ID (if enabled)
};

  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Initialize Firestore
  const db = firebase.firestore();
