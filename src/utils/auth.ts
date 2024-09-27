import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from "firebase/auth";
import { initializeApp } from "firebase/app";


const auth = getAuth(initializeApp({
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
}))

export function createUser(email: string, password: string): void {
    createUserWithEmailAndPassword(auth, email, password);
}

export function signInUser(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
}