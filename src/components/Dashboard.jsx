import { useMemo, useState } from 'react'
import { buildStageSummary, buildWipRows, groupByPO, groupWipByStyle, poListFromOrders } from '../utils/aggregate'
import DeficitBadge from './DeficitBadge'
import WipBadge from './WipBadge'

const STAGES = [
  { key: 'production', label: 'Produksi' },
  { key: 'packing', label: 'Packing' },
]

function toMap(groups) {
  const m = new Map()
  for (const g of groups) m.set(g.po, g)
  return m
}

export default function Dashboard({ orders, productions, packing, loading }) {
  const [filterPO, setFilterPO] = useState('all')

  const stageGroupMaps = useMemo(() => {
    const entriesByStage = { production: productions, packing }
    const result = {}
    for (const s of STAGES) {
      const rows = buildStageSummary(orders, entriesByStage[s.key])
      result[s.key] = toMap(groupByPO(rows))
    }
    return result
  }, [orders, productions, packing])

  // WIP = sudah Produksi tapi belum Packing, dihitung per PO dari hasil stageGroupMaps di atas
  const wipByPO = useMemo(() => {
    const map = new Map()
    for (const po of poListFromOrders(orders)) {
      const prodItems = stageGroupMaps.production.get(po)?.items ?? []
      const packItems = stageGroupMaps.packing.get(po)?.items ?? []
      const rows = buildWipRows(prodItems, packItems)
      map.set(po, {
        po,
        items: rows,
        styles: groupWipByStyle(rows),
        totalProduced: rows.reduce((s, r) => s + r.producedQty, 0),
        totalPacked: rows.reduce((s, r) => s + r.packedQty, 0),
        totalWip: rows.reduce((s, r) => s + r.wip, 0),
      })
    }
    return map
  }, [orders, stageGroupMaps])

  const allPOs = useMemo(() => poListFromOrders(orders), [orders])

  // Urutkan PO: yang belum selesai packing (tahap akhir) tampil lebih dulu
  const sortedPOs = useMemo(() => {
    const arr = [...allPOs]
    arr.sort((a, b) => {
      const aDone = stageGroupMaps.packing.get(a)?.isComplete ?? false
      const bDone = stageGroupMaps.packing.get(b)?.isComplete ?? false
      if (aDone !== bDone) return aDone ? 1 : -1
      return a.localeCompare(b)
    })
    return arr
  }, [allPOs, stageGroupMaps])

  const visiblePOs = filterPO === 'all' ? sortedPOs : sortedPOs.filter((p) => p === filterPO)

  const totalPO = allPOs.length
  const completedPO = allPOs.filter((p) => stageGroupMaps.packing.get(p)?.isComplete).length
  const totalOrder = orders.reduce((s, o) => s + (Number(o.qty) || 0), 0)
  const totalWip = allPOs.reduce((s, p) => s + (wipByPO.get(p)?.totalWip ?? 0), 0)

  if (loading) {
    return <p className="text-sm text-inkFaint font-mono">Memuat data…</p>
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white/70 border border-paperLine rounded-sm p-8 text-center">
        <p className="font-display text-lg text-ink uppercase tracking-wide mb-1">
          Belum Ada Data
        </p>
        <p className="text-sm text-inkFaint">
          Mulai dengan mencatat order (beserta nomor PO) pada tab{' '}
          <span className="font-semibold">Order</span>, lalu input hasil tiap tahap pada tab{' '}
          <span className="font-semibold">Input Produksi / Washing / Packing</span>.
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
          label="PO Selesai (Packing)"
          value={`${completedPO} / ${totalPO}`}
          tone={completedPO === totalPO ? 'greenpen' : 'ink'}
        />
        <StatCard label="Total Order" value={totalOrder} />
        <StatCard
          label="Total WIP"
          value={totalWip}
          tone={totalWip > 0 ? 'amber' : totalWip < 0 ? 'redpen' : 'greenpen'}
        />
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
          {allPOs.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Kartu per PO */}
      <div className="space-y-8">
        {visiblePOs.map((po) => {
          const packingGroup = stageGroupMaps.packing.get(po)
          const wipGroup = wipByPO.get(po)
          return (
            <div key={po} className="bg-white/70 border border-paperLine rounded-sm overflow-hidden">
              {/* Header PO */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-paperLine bg-paperLine/20">
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg tracking-wide text-ink uppercase">
                    PO {po}
                  </span>
                  <StatusStamp isComplete={packingGroup?.isComplete ?? false} />
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-inkSoft">
                  {STAGES.map((s) => {
                    const g = stageGroupMaps[s.key].get(po)
                    return (
                      <span key={s.key}>
                        {s.label}:{' '}
                        <span className="tabular">
                          {g?.totalDone ?? 0}/{g?.totalOrder ?? 0}
                        </span>
                      </span>
                    )
                  })}
                  <span>
                    WIP: <span className="tabular">{wipGroup?.totalWip ?? 0}</span>
                  </span>
                </div>
              </div>

              {/* Section Produksi */}
              <div className="divide-y divide-paperLine">
                <StageSection label="Produksi" group={stageGroupMaps.production.get(po)} />

                {/* Section WIP — barang yang sudah Produksi tapi belum Packing */}
                <WipSection group={wipGroup} />

                <StageSection label="Packing" group={stageGroupMaps.packing.get(po)} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WipSection({ group }) {
  if (!group) return null
  return (
    <div>
      <div className="flex items-center justify-between px-5 py-2.5 bg-amberSoft/20">
        <span className="font-display uppercase tracking-widest text-ink text-xs">
          WIP — Belum Di-Packing
        </span>
        <div className="flex items-center gap-3 text-xs font-mono text-inkSoft">
          <span>
            Produksi <span className="tabular">{group.totalProduced}</span>
          </span>
          <span>
            Packing <span className="tabular">{group.totalPacked}</span>
          </span>
          <WipBadge value={group.totalWip} />
        </div>
      </div>

      {group.styles.map((st) => (
        <div key={st.style}>
          <div className="flex items-center justify-between px-5 py-1.5 bg-paper/20 border-t border-paperLine/40">
            <span className="font-mono text-[11px] text-inkSoft uppercase">{st.style}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-inkFaint font-mono text-[11px] uppercase border-b border-paperLine/60">
                  <th className="py-1.5 pl-5 pr-4">Body</th>
                  <th className="py-1.5 pr-4">Size</th>
                  <th className="py-1.5 pr-4 text-right">Produksi</th>
                  <th className="py-1.5 pr-4 text-right">Packing</th>
                  <th className="py-1.5 pr-5 text-right">WIP</th>
                </tr>
              </thead>
              <tbody>
                {st.items.map((r) => (
                  <tr key={`${r.body}-${r.size}`} className="border-b border-paperLine/30 last:border-0">
                    <td className="py-1.5 pl-5 pr-4">{r.body}</td>
                    <td className="py-1.5 pr-4 font-mono">{r.size}</td>
                    <td className="py-1.5 pr-4 font-mono tabular text-right">{r.producedQty}</td>
                    <td className="py-1.5 pr-4 font-mono tabular text-right">{r.packedQty}</td>
                    <td className="py-1.5 pr-5 text-right">
                      <WipBadge value={r.wip} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

function StageSection({ label, group }) {
  if (!group) return null
  return (
    <div>
      <div className="flex items-center justify-between px-5 py-2.5 bg-paper/40">
        <span className="font-display uppercase tracking-widest text-ink text-xs">{label}</span>
        <div className="flex items-center gap-3 text-xs font-mono text-inkSoft">
          <span>
            Order <span className="tabular">{group.totalOrder}</span>
          </span>
          <span>
            {label} <span className="tabular">{group.totalDone}</span>
          </span>
          <DeficitBadge value={group.totalSelisih} />
        </div>
      </div>

      {group.styles.map((st) => (
        <div key={st.style}>
          <div className="flex items-center justify-between px-5 py-1.5 bg-paper/20 border-t border-paperLine/40">
            <span className="font-mono text-[11px] text-inkSoft uppercase">{st.style}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-inkFaint font-mono text-[11px] uppercase border-b border-paperLine/60">
                  <th className="py-1.5 pl-5 pr-4">Body</th>
                  <th className="py-1.5 pr-4">Size</th>
                  <th className="py-1.5 pr-4 text-right">Order</th>
                  <th className="py-1.5 pr-4 text-right">{label}</th>
                  <th className="py-1.5 pr-5 text-right">Selisih</th>
                </tr>
              </thead>
              <tbody>
                {st.items.map((r) => (
                  <tr key={`${r.body}-${r.size}`} className="border-b border-paperLine/30 last:border-0">
                    <td className="py-1.5 pl-5 pr-4">{r.body}</td>
                    <td className="py-1.5 pr-4 font-mono">{r.size}</td>
                    <td className="py-1.5 pr-4 font-mono tabular text-right">{r.orderQty}</td>
                    <td className="py-1.5 pr-4 font-mono tabular text-right">{r.doneQty}</td>
                    <td className="py-1.5 pr-5 text-right">
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
    tone === 'redpen'
      ? 'text-redpen'
      : tone === 'greenpen'
        ? 'text-greenpen'
        : tone === 'amber'
          ? 'text-amber'
          : 'text-ink'
  return (
    <div className="bg-white/70 border border-paperLine rounded-sm p-4">
      <div className="text-[11px] font-mono text-inkFaint uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className={`font-display text-2xl tabular ${toneClass}`}>{value}</div>
    </div>
  )
}
