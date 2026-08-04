import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Konfigurasi diambil dari environment variables (lihat file .env.example).
// Saat deploy di Cloudflare Pages, isi variable yang sama di
// Settings -> Environment variables pada project Cloudflare Pages kamu.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

// App instance KEDUA, dipakai khusus saat King membuat user baru.
// Ini supaya proses "createUserWithEmailAndPassword" tidak menggantikan
// sesi login King yang sedang aktif (perilaku default Firebase Auth
// adalah otomatis login sebagai user yang baru dibuat).
const secondaryApp = initializeApp(firebaseConfig, 'Secondary')
export const secondaryAuth = getAuth(secondaryApp)
