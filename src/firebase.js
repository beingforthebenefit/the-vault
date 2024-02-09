
import { initializeApp } from "firebase/app"
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAy0CiTHNjalXNOmsj8cBs51Yiga627EhA",
  authDomain: "the-vault-58e18.firebaseapp.com",
  projectId: "the-vault-58e18",
  storageBucket: "the-vault-58e18.appspot.com",
  messagingSenderId: "977502941882",
  appId: "1:977502941882:web:76c97af7a8ae3b89650883"
}
const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)