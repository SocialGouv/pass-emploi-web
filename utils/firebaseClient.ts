import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import {
  Auth,
  getAuth,
  signInWithCustomToken,
  signOut,
  UserCredential,
} from 'firebase/auth'
import { Firestore, getFirestore } from 'firebase/firestore'

class FirebaseClient {
  private firebaseApp: FirebaseApp
  private auth: Auth

  constructor() {
    this.firebaseApp = this.init()
    this.auth = getAuth()
  }

  private init() {
    if (!getApps().length) {
      return initializeApp({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      })
    } else {
      return getApp() // if already initialized, use that one
    }
  }

  getDb(): Firestore {
    return getFirestore(this.firebaseApp)
  }

  signIn(token: string): Promise<UserCredential> {
    return signInWithCustomToken(this.auth, token)
  }

  signOut(): Promise<void> {
    return signOut(this.auth)
  }

  firebaseIsSignedIn(): boolean {
    return Boolean(this.auth.currentUser)
  }
}

export { FirebaseClient }
