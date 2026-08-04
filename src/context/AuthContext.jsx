import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [name, setName] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [roleLoading, setRoleLoading] = useState(false)

  // Pantau status login (siapa yang sedang login, atau belum login sama sekali)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
      if (!u) {
        setRole(null)
        setName(null)
      }
    })
    return () => unsub()
  }, [])

  // Setelah tahu siapa yang login, ambil data level (role) dari Firestore koleksi "users"
  useEffect(() => {
    if (!user) return
    setRoleLoading(true)
    const unsub = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        if (snap.exists()) {
          setRole(snap.data().role || null)
          setName(snap.data().name || null)
        } else {
          setRole(null)
          setName(null)
        }
        setRoleLoading(false)
      },
      () => {
        setRole(null)
        setRoleLoading(false)
      }
    )
    return () => unsub()
  }, [user])

  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    await firebaseSignOut(auth)
  }

  const loading = authLoading || (!!user && roleLoading)

  return (
    <AuthContext.Provider value={{ user, role, name, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
