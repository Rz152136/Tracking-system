import { useMemo, useState } from 'react'
import { buildSummary, groupByPO } from '../utils/aggregate'
import DeficitBadge from './DeficitBadge'

export default function Dashboard({ orders, productions, loading }) {
  const [filterPO, setFilterPO] = useState('all')

  const summary = useMemo(() => buildSummary(orders, productions), [orders, productions])
  const allPOGroups = useMemo(() => groupByPO(summary), [summary])
  const poNames = useMemo(() => allPOGroups.map((g) => g.po), [allPOGroups])

  const poGroups =
    filterPO === 'all' ? allPOGroups : allPOGroups.filter((g) => g.po === filterPO)

  const totalPO = allPOGroups.length
  const completedPO = allPOGroups.filter((g) => g.isComplete).length
  const totalOrder = summary.reduce((s, r) => s + r.orderQty, 0)
  const totalProduced = summary.reduce((s, r) => s + r.producedQty, 0)

  if (loading) {
    return <p className="text-sm text-inkFaint font-mono">Memuat data…</p>
  }

  if (summary.length === 0) {
    return (
      <div className="bg-white/70 border border-paperLine rounded-sm p-8 text-center">
        <p className="font-display text-lg text-ink uppercase tracking-wide mb-1">
          Belum Ada Data
        </p>
        <p className="text-sm text-inkFaint">
          Mulai dengan mencatat order (beserta nomor PO) pada tab{' '}
          <span className="font-semibold">Order</span>, lalu input hasil produksi pada tab{' '}
          <span className="font-semibold">Input Produksi</span>.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Ringkasan angka */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total PO" value={totalPO} />
        <StatCard
          label="PO Selesai"
          value={`${completedPO} / ${totalPO}`}
          tone={completedPO === totalPO ? 'greenpen' : 'ink'}
        />
        <StatCard label="Total Order" value={totalOrder} />
        <StatCard label="Total Produksi" value={totalProduced} />
      </div>

      {/* Filter PO */}
      <div className="flex items-center gap-2 mb-4">
        <label className="text-xs font-mono text-inkFaint uppercase">Filter PO</label>
        <select
          value={filterPO}
          onChange={(e) => setFilterPO(e.target.value)}
          className="border border-paperLine bg-paper px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink/30"
        >
          <option value="all">Semua PO</option>
          {poNames.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Kartu per PO */}
      <div className="space-y-6">
        {poGroups.map((g) => (
          <div key={g.po} className="bg-white/70 border border-paperLine rounded-sm overflow-hidden">
            {/* Header PO */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-paperLine bg-paperLine/20">
              <div className="flex items-center gap-3">
                <span className="font-display text-lg tracking-wide text-ink uppercase">
                  PO {g.po}
                </span>
                <StatusStamp isComplete={g.isComplete} />
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-inkSoft">
                <span>Order: <span className="tabular">{g.totalOrder}</span></span>
                <span>Produksi: <span className="tabular">{g.totalProduced}</span></span>
                {!g.isComplete && (
                  <span className="text-redpen">{g.shortLines} baris masih kurang</span>
                )}
              </div>
            </div>

            {/* Breakdown per style di dalam PO ini */}
            <div className="divide-y divide-paperLine/60">
              {g.styles.map((s) => (
                <div key={s.style}>
                  <div className="flex items-center justify-between px-5 py-2.5 bg-paper/40">
                    <span className="font-display uppercase tracking-wide text-ink text-xs">
                      {s.style}
                    </span>
                    <div className="flex items-center gap-3 text-xs font-mono text-inkSoft">
                      <span>Order <span className="tabular">{s.totalOrder}</span></span>
                      <span>Produksi <span className="tabular">{s.totalProduced}</span></span>
                      <DeficitBadge value={s.totalSelisih} />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-inkFaint font-mono text-[11px] uppercase border-b border-paperLine">
                          <th className="py-2 pl-5 pr-4">Body</th>
                          <th className="py-2 pr-4">Size</th>
                          <th className="py-2 pr-4 text-right">Order</th>
                          <th className="py-2 pr-4 text-right">Produksi</th>
                          <th className="py-2 pr-5 text-right">Selisih</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.items.map((r) => (
                          <tr key={`${r.body}-${r.size}`} className="border-b border-paperLine/40 last:border-0">
                            <td className="py-2 pl-5 pr-4">{r.body}</td>
                            <td className="py-2 pr-4 font-mono">{r.size}</td>
                            <td className="py-2 pr-4 font-mono tabular text-right">{r.orderQty}</td>
                            <td className="py-2 pr-4 font-mono tabular text-right">{r.producedQty}</td>
                            <td className="py-2 pr-5 text-right">
                              <DeficitBadge value={r.selisih} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusStamp({ isComplete }) {
  if (isComplete) {
    return (
      <span className="inline-flex items-center gap-1.5 border-2 border-greenpen text-greenpen font-display uppercase tracking-widest text-xs px-3 py-1 rounded-sm -rotate-2 bg-greenpenSoft/40">
        ✓ Selesai
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 border-2 border-amber text-amber font-display uppercase tracking-widest text-xs px-3 py-1 rounded-sm -rotate-2 bg-amberSoft/40">
      Berjalan
    </span>
  )
}

function StatCard({ label, value, tone }) {
  const toneClass =
    tone === 'redpen' ? 'text-redpen' : tone === 'greenpen' ? 'text-greenpen' : 'text-ink'
  return (
    <div className="bg-white/70 border border-paperLine rounded-sm p-4">
      <div className="text-[11px] font-mono text-inkFaint uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className={`font-display text-2xl tabular ${toneClass}`}>{value}</div>
    </div>
  )
}
