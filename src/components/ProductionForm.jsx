import { useMemo, useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export default function ProductionForm({ orders }) {
  const [po, setPo] = useState('')
  const [style, setStyle] = useState('')
  const [body, setBody] = useState('')
  const [size, setSize] = useState('')
  const [qty, setQty] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)

  const poOptions = useMemo(
    () => Array.from(new Set(orders.map((o) => o.po).filter(Boolean))).sort(),
    [orders]
  )
  const styleOptions = useMemo(
    () =>
      Array.from(
        new Set(orders.filter((o) => !po || o.po === po).map((o) => o.style))
      ).sort(),
    [orders, po]
  )
  const bodyOptions = useMemo(
    () =>
      Array.from(
        new Set(
          orders
            .filter((o) => (!po || o.po === po) && (!style || o.style === style))
            .map((o) => o.body)
        )
      ).sort(),
    [orders, po, style]
  )
  const sizeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          orders
            .filter((o) => (!po || o.po === po) && o.style === style && o.body === body)
            .map((o) => o.size)
        )
      ),
    [orders, po, style, body]
  )

  async function handleSubmit(e) {
    e.preventDefault()
    if (!po.trim() || !style.trim() || !body.trim() || !size.trim() || !qty) return
    setSubmitting(true)
    setStatus(null)
    try {
      await addDoc(collection(db, 'productions'), {
        po: po.trim(),
        style: style.trim(),
        body: body.trim(),
        size: size.trim(),
        qty: Number(qty),
        date,
        note: note.trim() || null,
        createdAt: serverTimestamp(),
      })
      setStatus({ type: 'ok', msg: `Produksi ${qty} pcs tercatat untuk PO ${po.trim()}.` })
      setQty('')
      setNote('')
    } catch (err) {
      setStatus({ type: 'err', msg: 'Gagal menyimpan: ' + err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/70 border border-paperLine rounded-sm p-5">
      <div className="font-display uppercase tracking-wide text-ink text-sm mb-4 pb-2 border-b border-paperLine">
        Input Hasil Produksi
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Nomor PO</label>
          <input
            list="po-options-prod"
            value={po}
            onChange={(e) => setPo(e.target.value)}
            placeholder="cth. PO-4021"
            className="w-full border border-paperLine bg-paper px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink/30"
            required
          />
          <datalist id="po-options-prod">
            {poOptions.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Style</label>
          <input
            list="style-options"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="cth. AW26-JKT-014"
            className="w-full border border-paperLine bg-paper px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink/30"
            required
          />
          <datalist id="style-options">
            {styleOptions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Body</label>
          <input
            list="body-options"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="cth. Long, Regular, Short"
            className="w-full border border-paperLine bg-paper px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink/30"
            required
          />
          <datalist id="body-options">
            {bodyOptions.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Size</label>
          <input
            list="size-options"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="cth. M"
            className="w-full border border-paperLine bg-paper px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink/30"
            required
          />
          <datalist id="size-options">
            {sizeOptions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-mono text-inkFaint uppercase mb-1">
            Qty Diproduksi
          </label>
          <input
            type="number"
            min="0"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="0"
            className="w-full border border-paperLine bg-paper px-3 py-2 text-sm font-mono tabular focus:outline-none focus:ring-2 focus:ring-ink/30"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Tanggal</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-paperLine bg-paper px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink/30"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-mono text-inkFaint uppercase mb-1">
            Catatan (opsional)
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="cth. line 3, shift pagi"
            className="w-full border border-paperLine bg-paper px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-ink/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-ink text-paper font-display uppercase tracking-wide text-sm px-5 py-2.5 rounded-sm hover:bg-ink/90 disabled:opacity-50"
        >
          {submitting ? 'Menyimpan…' : 'Simpan Produksi'}
        </button>
        {status && (
          <span
            className={`text-xs font-mono ${
              status.type === 'ok' ? 'text-greenpen' : 'text-redpen'
            }`}
          >
            {status.msg}
          </span>
        )}
      </div>
    </form>
  )
}
