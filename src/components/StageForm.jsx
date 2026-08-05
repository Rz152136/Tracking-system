import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export default function StageForm({ collectionName, stageLabel, orders }) {
  const [po, setPo] = useState('')
  const [style, setStyle] = useState('')
  const [body, setBody] = useState('')
  const [size, setSize] = useState('')
  const [qty, setQty] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)

  // Semua pilihan di bawah ini HANYA berisi kombinasi yang sudah pernah
  // diinput di halaman Order — tidak bisa ketik bebas.
  const poOptions = useMemo(
    () => Array.from(new Set(orders.map((o) => o.po).filter(Boolean))).sort(),
    [orders]
  )
  const styleOptions = useMemo(
    () =>
      Array.from(new Set(orders.filter((o) => o.po === po).map((o) => o.style))).sort(),
    [orders, po]
  )
  const bodyOptions = useMemo(
    () =>
      Array.from(
        new Set(orders.filter((o) => o.po === po && o.style === style).map((o) => o.body))
      ).sort(),
    [orders, po, style]
  )
  const sizeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          orders
            .filter((o) => o.po === po && o.style === style && o.body === body)
            .map((o) => o.size)
        )
      ),
    [orders, po, style, body]
  )

  // Reset pilihan di bawahnya kalau pilihan di atasnya berubah dan sudah tidak valid lagi
  useEffect(() => {
    if (style && !styleOptions.includes(style)) setStyle('')
  }, [styleOptions, style])
  useEffect(() => {
    if (body && !bodyOptions.includes(body)) setBody('')
  }, [bodyOptions, body])
  useEffect(() => {
    if (size && !sizeOptions.includes(size)) setSize('')
  }, [sizeOptions, size])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!po || !style || !body || !size || !qty) return
    setSubmitting(true)
    setStatus(null)
    try {
      await addDoc(collection(db, collectionName), {
        po,
        style,
        body,
        size,
        qty: Number(qty),
        date,
        note: note.trim() || null,
        createdAt: serverTimestamp(),
      })
      setStatus({ type: 'ok', msg: `${stageLabel}: ${qty} pcs tercatat untuk PO ${po}.` })
      setQty('')
      setNote('')
    } catch (err) {
      setStatus({ type: 'err', msg: 'Gagal menyimpan: ' + err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const selectClass =
    'w-full border border-paperLine bg-paper px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink/30 disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <form onSubmit={handleSubmit} className="bg-white/70 border border-paperLine rounded-sm p-5">
      <div className="font-display uppercase tracking-wide text-ink text-sm mb-1 pb-2 border-b border-paperLine">
        Input {stageLabel}
      </div>
      <p className="text-xs font-mono text-inkFaint mb-4 mt-2">
        Pilihan di bawah hanya menampilkan PO / Style / Body / Size yang sudah tercatat di tab
        Order.
      </p>

      {poOptions.length === 0 ? (
        <p className="text-sm text-inkFaint font-mono">
          Belum ada data Order sama sekali. Tambahkan Order terlebih dahulu di tab{' '}
          <span className="font-semibold">Order</span>.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-inkFaint uppercase mb-1">
              Nomor PO
            </label>
            <select
              value={po}
              onChange={(e) => {
                setPo(e.target.value)
                setStyle('')
                setBody('')
                setSize('')
              }}
              className={selectClass}
              required
            >
              <option value="">-- Pilih PO --</option>
              {poOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Style</label>
            <select
              value={style}
              onChange={(e) => {
                setStyle(e.target.value)
                setBody('')
                setSize('')
              }}
              className={selectClass}
              disabled={!po}
              required
            >
              <option value="">-- Pilih Style --</option>
              {styleOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Body</label>
            <select
              value={body}
              onChange={(e) => {
                setBody(e.target.value)
                setSize('')
              }}
              className={selectClass}
              disabled={!style}
              required
            >
              <option value="">-- Pilih Body --</option>
              {bodyOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-inkFaint uppercase mb-1">Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className={selectClass}
              disabled={!body}
              required
            >
              <option value="">-- Pilih Size --</option>
              {sizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-inkFaint uppercase mb-1">
              Qty {stageLabel}
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
            <label className="block text-xs font-mono text-inkFaint uppercase mb-1">
              Tanggal
            </label>
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
      )}

      <div className="flex items-center gap-3 mt-4">
        <button
          type="submit"
          disabled={submitting || poOptions.length === 0}
          className="bg-ink text-paper font-display uppercase tracking-wide text-sm px-5 py-2.5 rounded-sm hover:bg-ink/90 disabled:opacity-50"
        >
          {submitting ? 'Menyimpan…' : `Simpan ${stageLabel}`}
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
  )
}
