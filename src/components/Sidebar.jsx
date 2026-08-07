import { canAccess, TAB_LABELS } from '../utils/permissions'

export default function Sidebar({ active, onChange, role, name, email, onLogout }) {
  const tabs = Object.keys(TAB_LABELS).filter((id) => canAccess(role, id))

  return (
    <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-paperLine bg-paper/60 md:flex md:flex-col">
      <div className="p-5 border-b border-paperLine">
        <div className="font-display text-2xl tracking-wide text-ink leading-none">
          RISE
        </div>
        <div className="text-[10px] font-mono text-inkFaint mt-1 tracking-widest uppercase leading-snug">
          Production Monitoring System
          <br />
          for Garment Manufacturing
        </div>
      </div>
      <nav className="flex md:flex-col p-2 gap-1">
        {tabs.map((id) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-3 text-left px-3 py-2.5 rounded-sm transition-colors ${
              active === id
                ? 'bg-ink text-paper'
                : 'text-inkSoft hover:bg-paperLine/40 hover:text-ink'
            }`}
          >
            <span className="font-mono text-[11px] opacity-70">{TAB_LABELS[id].code}</span>
            <span className="font-display text-sm tracking-wide uppercase">
              {TAB_LABELS[id].label}
            </span>
          </button>
        ))}
      </nav>

      <div className="md:mt-auto p-4 border-t border-paperLine">
        <div className="text-xs font-mono text-inkSoft truncate">{name || email}</div>
        <div className="text-[10px] font-mono text-inkFaint uppercase tracking-widest mb-2">
          Level: {role}
        </div>
        <button
          onClick={onLogout}
          className="text-xs font-mono text-redpen hover:underline"
        >
          Keluar
        </button>
      </div>
    </aside>
  )
}
