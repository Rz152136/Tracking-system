
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const SIZE_TAGS = ['S', 'M', 'L', 'XL']

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
        @keyframes bob {
          0%, 100% { transform: translateY(0) rotate(var(--rot, -4deg)); }
          50%      { transform: translateY(-10px) rotate(var(--rot, -4deg)); }
        }
        @keyframes sortMove {
          0%   { left: 2%; }
          22%  { left: 2%; }
          28%  { left: 26%; }
          47%  { left: 26%; }
          53%  { left: 50%; }
          72%  { left: 50%; }
          78%  { left: 74%; }
          97%  { left: 74%; }
          100% { left: 74%; }
        }
        @keyframes pulseTag {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.12); }
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
        .float-tag {
          animation: bob 4.5s ease-in-out infinite;
          opacity: 0;
          animation: bob 4.5s ease-in-out infinite, fadeIn 0.6s ease-out 1.3s forwards;
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        .sort-icon {
          animation: sortMove 8s ease-in-out infinite;
        }
        .sort-tag {
          animation: pulseTag 8s ease-in-out infinite;
        }
      `}</style>

      {/* Panel kain kiri & kanan — bergaya placket kemeja, terbuka saat halaman dimuat */}
      <div className="pointer-events-none fixed inset-0 z-20 flex">
        <div
          className="curtain-panel-left relative w-1/2 h-full bg-ink flex items-center justify-end pr-1 sm:pr-2"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(250,250,247,0.08) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        >
          <span className="font-display text-paper/90 text-lg sm:text-2xl tracking-widest uppercase">
            Spec
          </span>
          <div className="absolute right-0 top-0 h-full w-px border-r-2 border-dashed border-paper/30" />
          <Dot style={{ top: '30%' }} />
          <Dot style={{ top: '50%' }} />
          <Dot style={{ top: '70%' }} />
        </div>
        <div
          className="curtain-panel-right relative w-1/2 h-full bg-ink flex items-center justify-start pl-1 sm:pl-2"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(250,250,247,0.08) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        >
          <span className="font-display text-paper/90 text-lg sm:text-2xl tracking-widest uppercase">
            Board
          </span>
        </div>
      </div>

      {/* Tag ukuran mengambang di sekitar layar — dekorasi, disembunyikan di layar sangat kecil */}
      <FloatingTag className="hidden sm:flex top-[12%] left-[8%]" rot="-8deg" delay="0s" label="M" />
      <FloatingTag className="hidden sm:flex top-[20%] right-[10%]" rot="6deg" delay="0.6s" label="L" />
      <FloatingTag className="hidden md:flex bottom-[16%] left-[12%]" rot="5deg" delay="1.1s" label="S" />
      <FloatingTag className="hidden sm:flex bottom-[14%] right-[9%]" rot="-6deg" delay="1.6s" label="XL" />

      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8">
        {/* Kartu login */}
        <form
          onSubmit={handleSubmit}
          className="login-card w-full max-w-sm bg-white/80 backdrop-blur-sm border border-paperLine rounded-sm p-6 sm:p-8 shadow-[0_2px_20px_rgba(27,42,74,0.08)]"
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

        {/* Strip animasi "menyortir baju per size" */}
        <div className="login-card w-full max-w-sm px-1" style={{ animationDelay: '1.15s' }}>
          <div className="relative h-14 bg-white/60 border border-paperLine rounded-sm overflow-hidden">
            {/* garis jalur */}
            <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 border-t border-dashed border-paperLine" />
            {/* tag ukuran di sepanjang jalur */}
            <div className="absolute inset-0 flex items-center justify-between px-[7%]">
              {SIZE_TAGS.map((s, i) => (
                <span
                  key={s}
                  className="sort-tag font-mono text-[11px] text-inkSoft bg-paper border border-paperLine rounded-sm px-1.5 py-0.5"
                  style={{ animationDelay: `${i * 2}s` }}
                >
                  {s}
                </span>
              ))}
            </div>
            {/* icon baju yang bergerak menyortir */}
            <div className="sort-icon absolute top-1/2 -translate-y-1/2 -translate-x-1/2">
              <ShirtIcon />
            </div>
          </div>
          <p className="text-center text-[10px] font-mono text-inkFaint mt-2 tracking-widest uppercase">
            Sorting by size…
          </p>
        </div>
      </div>
    </div>
  )
}

function FloatingTag({ className = '', rot, delay, label }) {
  return (
    <div
      className={`float-tag pointer-events-none fixed z-10 items-center justify-center w-10 h-10 rounded-sm border-2 border-dashed border-inkFaint/40 bg-white/50 font-mono text-xs text-inkSoft ${className}`}
      style={{ '--rot': rot, animationDelay: delay }}
    >
      {label}
    </div>
  )
}

function ShirtIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 3L4 6l1.5 2.5L8 7v11.5A1.5 1.5 0 0 0 9.5 20h5a1.5 1.5 0 0 0 1.5-1.5V7l2.5 1.5L20 6l-4-3-2 1.5h-4L8 3Z"
        fill="#1B2A4A"
      />
    </svg>
  )
}

function Dot({ style }) {
  return (
    <span
      className="absolute right-[-3px] w-1.5 h-1.5 rounded-full bg-paper/40"
      style={style}
      aria-hidden="true"
    />
  )
}
