// Firebase Configuration for OutreachAI
const firebaseConfig = {
    apiKey: "AIzaSyBFrmsF4I-LiwiHeMpuGeVVwlcm9DS6_Po",
    authDomain: "outreachai-de3e5.firebaseapp.com",
    projectId: "outreachai-de3e5",
    storageBucket: "outreachai-de3e5.firebasestorage.app",
    messagingSenderId: "625819171536",
    appId: "1:625819171536:web:d747bdea897b550c72bcd5"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Initialize Firestore
  const db = firebase.firestore();