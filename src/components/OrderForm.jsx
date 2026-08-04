import { useMemo, useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL']

export default function OrderForm({ orders = [] }) {
  const [po, setPo] = useState('')
  const [style, setStyle] = useState('')
  const [body, setBody] = useState('')
  const [size, setSize] = useState(DEFAULT_SIZES[0])
  const [customSize, setCustomSize] = useState('')
  const [qty, setQty] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)

  const finalSize = size === 'custom' ? customSize.trim() : size

  const poOptions = useMemo(
    () => Array.from(new Set(orders.map((o) => o.po).filter(Boolean))).sort(),
    [orders]
  )
  const bodyOptions = useMemo(
    () => Array.from(new Set(orders.map((o) => o.body).filter(Boolean))).sort(),
    [orders]
  )

  async function handleSubmit(e) {
    e.preventDefault()
    if (!po.trim() || !style.trim() || !body.trim() || !finalSize || !qty) return
    setSubmitting(true)
    setStatus(null)
    try {
      await addDoc(collection(db, 'orders'), {
        po: po.trim(),
        style: style.trim(),
        body: body.trim(),
        size: finalSize,
        qty: Number(qty),
        note: note.trim() || null,
        createdAt: serverTimestamp(),
      })
      setStatus({ type: 'ok', msg: `Order ${style.trim()} / ${body.trim()} / ${finalSize} tersimpan di PO ${po.trim()}.` })
      setStyle('')
      setQty('')
      setNote('')
    } catch (err) {
      setStatus({ type: 'err', msg: 'Gagal menyimpan order: ' + err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/70 border border-paperLine rounded-sm p-5">
      <div className="font-display uppercase tracking-wide text-ink text-sm mb-4 pb-2 border-b border-paperLine">
        Catat Order Baru
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Nomor PO</label>
          <input
            list="po-options"
            value={po}
            onChange={(e) => setPo(e.target.value)}
            placeholder="cth. PO-4021"
            className="w-full border border-paperLine bg-paper px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink/30"
            required
          />
          <datalist id="po-options">
            {poOptions.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Style</label>
          <input
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="cth. AW26-JKT-014"
            className="w-full border border-paperLine bg-paper px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink/30"
            required
          />
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
          <div className="flex gap-2">
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full border border-paperLine bg-paper px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink/30"
            >
              {DEFAULT_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="custom">Lainnya…</option>
            </select>
          </div>
          {size === 'custom' && (
            <input
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              placeholder="cth. 28, 30/32"
              className="mt-2 w-full border border-paperLine bg-paper px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink/30"
              required
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Qty Order</label>
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
          <label className="block text-xs font-mono text-inkFaint uppercase mb-1">
            Catatan (opsional)
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="cth. buyer ABC"
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
          {submitting ? 'Menyimpan…' : 'Simpan Order'}
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
