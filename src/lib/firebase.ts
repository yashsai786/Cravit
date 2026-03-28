import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxrSkmZlmUS5lrI35UT29hPJ86A9PaZg4",
  authDomain: "cravit-ecec4.firebaseapp.com",
  projectId: "cravit-ecec4",
  storageBucket: "cravit-ecec4.firebasestorage.app",
  messagingSenderId: "635617827631",
  appId: "1:635617827631:web:a8c1230013e081b66e9fda",
  measurementId: "G-5RLLWX80E3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Ensure auth state persists on page refresh
setPersistence(auth, browserLocalPersistence);

export { auth, db, googleProvider, analytics };
export default app;
