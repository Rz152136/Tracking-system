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
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-5">
      <style>{`
        @keyframes curtainLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        @keyframes curtainRight {
          0%   { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        @keyframes cardReveal {
          0%   { opacity: 0; transform: translateY(14px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .curtain-panel-left {
          animation: curtainLeft 0.9s cubic-bezier(0.65, 0, 0.35, 1) 0.55s forwards;
        }
        .curtain-panel-right {
          animation: curtainRight 0.9s cubic-bezier(0.65, 0, 0.35, 1) 0.55s forwards;
        }
        .login-card {
          animation: cardReveal 0.6s ease-out 1s forwards;
          opacity: 0;
        }
      `}</style>

      {/* Panel kain kiri & kanan — bergaya placket kemeja, terbuka saat halaman dimuat */}
      <div className="pointer-events-none fixed inset-0 z-20 flex">
        <div
          className="curtain-panel-left relative w-1/2 h-full bg-ink flex items-center justify-end pr-1 sm:pr-2"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(250,250,247,0.08) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        >
          <span className="font-display text-paper/90 text-lg sm:text-2xl tracking-widest uppercase">
            Spec
          </span>
          <div className="absolute right-0 top-0 h-full w-px border-r-2 border-dashed border-paper/30" />
          <Button style={{ top: '30%' }} />
          <Button style={{ top: '50%' }} />
          <Button style={{ top: '70%' }} />
        </div>
        <div
          className="curtain-panel-right relative w-1/2 h-full bg-ink flex items-center justify-start pl-1 sm:pl-2"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(250,250,247,0.08) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        >
          <span className="font-display text-paper/90 text-lg sm:text-2xl tracking-widest uppercase">
            Board
          </span>
        </div>
      </div>

      {/* Kartu login */}
      <form
        onSubmit={handleSubmit}
        className="login-card relative z-10 w-full max-w-sm bg-white/80 backdrop-blur-sm border border-paperLine rounded-sm p-6 sm:p-8 shadow-[0_2px_20px_rgba(27,42,74,0.08)]"
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="font-display text-2xl sm:text-3xl tracking-wide text-ink">
            SPEC BOARD
          </div>
          <div className="text-[10px] sm:text-[11px] font-mono text-inkFaint mt-1.5 tracking-widest uppercase">
            Production Tracker — Login
          </div>
        </div>

        <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-paperLine bg-paper px-3 py-2.5 text-sm font-mono mb-4 focus:outline-none focus:ring-2 focus:ring-ink/30"
          required
          autoComplete="username"
        />

        <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-paperLine bg-paper px-3 py-2.5 text-sm font-mono mb-4 focus:outline-none focus:ring-2 focus:ring-ink/30"
          required
          autoComplete="current-password"
        />

        {error && <p className="text-xs font-mono text-redpen mb-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ink text-paper font-display uppercase tracking-wide text-sm px-5 py-3 rounded-sm hover:bg-ink/90 active:scale-[0.99] transition disabled:opacity-50"
        >
          {submitting ? 'Masuk…' : 'Masuk'}
        </button>

        <p className="text-center text-[11px] font-mono text-inkFaint mt-5">
          IE · Record · Operator · King
        </p>
      </form>
    </div>
  )
}

function Button({ style }) {
  return (
    <span
      className="absolute right-[-3px] w-1.5 h-1.5 rounded-full bg-paper/40"
      style={style}
      aria-hidden="true"
    />
  )
}
