import { useMemo, useState } from 'react'
import {
  buildStageSummary,
  buildWipRows,
  groupByPO,
  poListFromOrders,
  poStyleListFromOrders,
} from '../utils/aggregate'
import DeficitBadge from './DeficitBadge'
import WipBadge from './WipBadge'

const STAGES = [
  { key: 'production', label: 'Segregasi' },
  { key: 'packing', label: 'Polibag' },
]

function toMap(groups) {
  const m = new Map()
  for (const g of groups) m.set(g.po, g)
  return m
}

function findStyleGroup(poGroup, style) {
  return poGroup?.styles.find((s) => s.style === style) ?? null
}

export default function Dashboard({ orders, productions, packing, loading }) {
  const [filterPO, setFilterPO] = useState('all')

  // Peta per PO (masih dipakai sebagai sumber data), lalu nanti dipecah per PO+Style di bawah
  const stageGroupMaps = useMemo(() => {
    const entriesByStage = { production: productions, packing }
    const result = {}
    for (const s of STAGES) {
      const rows = buildStageSummary(orders, entriesByStage[s.key])
      result[s.key] = toMap(groupByPO(rows))
    }
    return result
  }, [orders, productions, packing])

  const allPOs = useMemo(() => poListFromOrders(orders), [orders])
  const allPoStyles = useMemo(() => poStyleListFromOrders(orders), [orders])

  // Bangun 1 "kartu" data untuk tiap kombinasi PO+Style
  const cards = useMemo(() => {
    return allPoStyles.map(({ po, style }) => {
      const segPoGroup = stageGroupMaps.production.get(po)
      const packPoGroup = stageGroupMaps.packing.get(po)

      const segStyle = findStyleGroup(segPoGroup, style)
      const packStyle = findStyleGroup(packPoGroup, style)

      const segItems = segStyle?.items ?? []
      const packItems = packStyle?.items ?? []
      const wipRows = buildWipRows(segItems, packItems)
      const totalWip = wipRows.reduce((s, r) => s + r.wip, 0)

      const isComplete = packItems.length > 0 && packItems.every((i) => i.selisih >= 0)

      return { po, style, segStyle, packStyle, wipRows, totalWip, isComplete }
    })
  }, [allPoStyles, stageGroupMaps])

  const cardMap = useMemo(() => {
    const m = new Map()
    for (const c of cards) m.set(`${c.po}\u0000${c.style}`, c)
    return m
  }, [cards])

  const sortedCards = useMemo(() => {
    const arr = [...cards]
    arr.sort((a, b) => {
      if (a.isComplete !== b.isComplete) return a.isComplete ? 1 : -1
      if (a.style !== b.style) return a.style.localeCompare(b.style)
      return a.po.localeCompare(b.po)
    })
    return arr
  }, [cards])

  const visibleCards =
    filterPO === 'all' ? sortedCards : sortedCards.filter((c) => c.po === filterPO)

  const totalPO = allPOs.length
  const totalStyle = useMemo(() => new Set(cards.map((c) => c.style)).size, [cards])
  const totalCards = cards.length
  const completedCards = cards.filter((c) => c.isComplete).length
  const totalOrder = orders.reduce((s, o) => s + (Number(o.qty) || 0), 0)
  const totalWip = cards.reduce((s, c) => s + c.totalWip, 0)

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
          <span className="font-semibold">Input Segregasi / Input Polibag</span>.
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
          label="PO+Style Selesai (Polibag)"
          value={`${completedCards} / ${totalCards}`}
          tone={completedCards === totalCards ? 'greenpen' : 'ink'}
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

      {/* 1 kartu per kombinasi PO + Style */}
      <div className="space-y-6">
        {visibleCards.map((c) => (
          <div
            key={`${c.po}\u0000${c.style}`}
            className="bg-white/70 border border-paperLine rounded-sm overflow-hidden"
          >
            {/* Header kartu */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-paperLine bg-paperLine/20">
              <div className="flex items-center gap-3">
                <span className="font-display text-lg tracking-wide text-ink uppercase">
                  {c.style}
                </span>
                <span className="font-mono text-sm text-inkSoft">· PO {c.po}</span>
                <StatusStamp isComplete={c.isComplete} />
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-inkSoft">
                <span>
                  Segregasi:{' '}
                  <span className="tabular">
                    {c.segStyle?.totalDone ?? 0}/{c.segStyle?.totalOrder ?? 0}
                  </span>
                </span>
                <span>
                  Polibag:{' '}
                  <span className="tabular">
                    {c.packStyle?.totalDone ?? 0}/{c.packStyle?.totalOrder ?? 0}
                  </span>
                </span>
                <span>
                  WIP: <span className="tabular">{c.totalWip}</span>
                </span>
              </div>
            </div>

            {/* Section per tahap, khusus untuk 1 style ini saja */}
            <div className="divide-y divide-paperLine">
              <SingleStyleStageSection label="Segregasi" styleGroup={c.segStyle} />
              <SingleStyleWipSection rows={c.wipRows} totalWip={c.totalWip} />
              <SingleStyleStageSection label="Polibag" styleGroup={c.packStyle} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SingleStyleStageSection({ label, styleGroup }) {
  if (!styleGroup) return null
  return (
    <div>
      <div className="flex items-center justify-between px-5 py-2.5 bg-paper/40">
        <span className="font-display uppercase tracking-widest text-ink text-xs">{label}</span>
        <div className="flex items-center gap-3 text-xs font-mono text-inkSoft">
          <span>
            Order <span className="tabular">{styleGroup.totalOrder}</span>
          </span>
          <span>
            {label} <span className="tabular">{styleGroup.totalDone}</span>
          </span>
          <DeficitBadge value={styleGroup.totalSelisih} />
        </div>
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
            {styleGroup.items.map((r) => (
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
  )
}

function SingleStyleWipSection({ rows, totalWip }) {
  if (!rows || rows.length === 0) return null
  const totalProduced = rows.reduce((s, r) => s + r.producedQty, 0)
  const totalPacked = rows.reduce((s, r) => s + r.packedQty, 0)
  return (
    <div>
      <div className="flex items-center justify-between px-5 py-2.5 bg-amberSoft/20">
        <span className="font-display uppercase tracking-widest text-ink text-xs">
          WIP — Belum Di-Polibag
        </span>
        <div className="flex items-center gap-3 text-xs font-mono text-inkSoft">
          <span>
            Segregasi <span className="tabular">{totalProduced}</span>
          </span>
          <span>
            Polibag <span className="tabular">{totalPacked}</span>
          </span>
          <WipBadge value={totalWip} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-inkFaint font-mono text-[11px] uppercase border-b border-paperLine/60">
              <th className="py-1.5 pl-5 pr-4">Body</th>
              <th className="py-1.5 pr-4">Size</th>
              <th className="py-1.5 pr-4 text-right">Segregasi</th>
              <th className="py-1.5 pr-4 text-right">Polibag</th>
              <th className="py-1.5 pr-5 text-right">WIP</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
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
