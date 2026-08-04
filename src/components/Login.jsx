import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError('Email atau password salah.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white/70 border border-paperLine rounded-sm p-6"
      >
        <div className="text-center mb-6">
          <div className="font-display text-2xl tracking-wide text-ink">SPEC BOARD</div>
          <div className="text-[11px] font-mono text-inkFaint mt-1 tracking-widest uppercase">
            Production Tracker — Login
          </div>
        </div>

        <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-paperLine bg-paper px-3 py-2 text-sm font-mono mb-4 focus:outline-none focus:ring-2 focus:ring-ink/30"
          required
          autoComplete="username"
        />

        <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-paperLine bg-paper px-3 py-2 text-sm font-mono mb-4 focus:outline-none focus:ring-2 focus:ring-ink/30"
          required
          autoComplete="current-password"
        />

        {error && <p className="text-xs font-mono text-redpen mb-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ink text-paper font-display uppercase tracking-wide text-sm px-5 py-2.5 rounded-sm hover:bg-ink/90 disabled:opacity-50"
        >
          {submitting ? 'Masuk…' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}
