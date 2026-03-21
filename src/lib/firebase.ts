import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmfQM4dW3iINiTJKUNkDDnBazsRLV2tfI",
  authDomain: "graphe-awards.firebaseapp.com",
  databaseURL: "https://graphe-awards-default-rtdb.firebaseio.com",
  projectId: "graphe-awards",
  storageBucket: "graphe-awards.firebasestorage.app",
  messagingSenderId: "787026566359",
  appId: "1:787026566359:web:922b937194ec1d39516492",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
