import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, signInWithCustomToken, signOut } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// initialization
let firebaseApp: FirebaseApp
if (!getApps().length) {
  firebaseApp = initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  })
} else {
  firebaseApp = getApp() // if already initialized, use that one
}

const auth = getAuth()
const db = getFirestore(firebaseApp)
const signInChat = (token: string) => signInWithCustomToken(auth, token)
const signOutChat = () => signOut(auth)

const firebaseIsSignedIn = () => Boolean(auth.currentUser)

export { db, signInChat, signOutChat, firebaseIsSignedIn }
