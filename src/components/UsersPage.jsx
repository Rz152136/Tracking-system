import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { db, secondaryAuth } from '../firebase'
import { ROLES } from '../utils/permissions'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(ROLES[0])
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || password.length < 6) return
    setSubmitting(true)
    setStatus(null)
    try {
      // Pakai secondaryAuth (bukan auth utama) supaya sesi login King saat ini tidak tergantikan.
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email.trim(), password)
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: name.trim(),
        email: email.trim(),
        role,
        createdAt: new Date().toISOString(),
      })
      await signOut(secondaryAuth)
      setStatus({ type: 'ok', msg: `User "${name.trim()}" (${role}) berhasil dibuat.` })
      setName('')
      setEmail('')
      setPassword('')
    } catch (err) {
      let msg = err.message
      if (err.code === 'auth/email-already-in-use') msg = 'Email ini sudah terdaftar.'
      if (err.code === 'auth/weak-password') msg = 'Password minimal 6 karakter.'
      setStatus({ type: 'err', msg: 'Gagal membuat user: ' + msg })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRoleChange(userId, newRole) {
    await updateDoc(doc(db, 'users', userId), { role: newRole })
  }

  async function handleDelete(userId, userEmail) {
    if (
      !confirm(
        `Cabut akses "${userEmail}"? User ini tidak akan bisa membuka halaman manapun lagi. (Akun login-nya sendiri masih ada di Firebase Authentication, tidak otomatis terhapus.)`
      )
    )
      return
    await deleteDoc(doc(db, 'users', userId))
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="bg-white/70 border border-paperLine rounded-sm p-5 mb-6">
        <div className="font-display uppercase tracking-wide text-ink text-sm mb-4 pb-2 border-b border-paperLine">
          Tambah User Baru
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Nama</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-paperLine bg-paper px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink/30"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-paperLine bg-paper px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink/30"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-inkFaint uppercase mb-1">
              Password (min. 6 karakter)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              className="w-full border border-paperLine bg-paper px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink/30"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Level User</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-paperLine bg-paper px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink/30"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-ink text-paper font-display uppercase tracking-wide text-sm px-5 py-2.5 rounded-sm hover:bg-ink/90 disabled:opacity-50"
          >
            {submitting ? 'Membuat…' : 'Buat User'}
          </button>
          {status && (
            <span
              className={`text-xs font-mono ${status.type === 'ok' ? 'text-greenpen' : 'text-redpen'}`}
            >
              {status.msg}
            </span>
          )}
        </div>
      </form>

      <div className="bg-white/70 border border-paperLine rounded-sm p-5">
        <div className="font-display uppercase tracking-wide text-ink text-sm mb-4 pb-2 border-b border-paperLine">
          Daftar User
        </div>
        {loading ? (
          <p className="text-sm text-inkFaint font-mono">Memuat…</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-inkFaint font-mono">Belum ada user.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-inkFaint font-mono text-xs uppercase border-b border-paperLine">
                  <th className="py-2 pr-4">Nama</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Level</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-paperLine/60">
                    <td className="py-2 pr-4">{u.name || '—'}</td>
                    <td className="py-2 pr-4 font-mono">{u.email}</td>
                    <td className="py-2 pr-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="border border-paperLine bg-paper px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ink/30"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleDelete(u.id, u.email)}
                        className="text-redpen text-xs font-mono hover:underline"
                      >
                        cabut akses
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-inkFaint font-mono mt-4 leading-relaxed">
          Catatan: "Cabut akses" menghentikan user tersebut membuka halaman manapun di aplikasi
          ini, tapi akun login-nya sendiri tetap ada di Firebase Authentication. Untuk menghapus
          akun login sepenuhnya, hapus manual lewat Firebase Console → Authentication → Users.
        </p>
      </div>
    </div>
  )
}
