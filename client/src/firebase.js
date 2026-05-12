import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

console.log("Firebase config loaded:", {
  apiKey: Boolean(firebaseConfig.apiKey),
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
});

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const logInWithEmailAndPassword = async (email, password) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const user = res.user;

    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const data = await getDocs(q);

    if (!data.empty) {
      const id = data.docs[0].id;

      await updateDoc(doc(db, "users", id), {
        isOnline: true,
      });
    }

    return user;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const logout = async (id) => {
  if (id) {
    await updateDoc(doc(db, "users", id), {
      isOnline: false,
    });
  }

  await signOut(auth);
};

export {
  auth,
  db,
  storage,
  logInWithEmailAndPassword,
  logout,
};