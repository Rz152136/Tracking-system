import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

export default function ProductionList({ productions, loading }) {
  async function handleDelete(id) {
    if (!confirm('Hapus data produksi ini?')) return
    await deleteDoc(doc(db, 'productions', id))
  }

  return (
    <div className="bg-white/70 border border-paperLine rounded-sm p-5 mt-6">
      <div className="font-display uppercase tracking-wide text-ink text-sm mb-4 pb-2 border-b border-paperLine">
        Riwayat Produksi
      </div>
      {loading ? (
        <p className="text-sm text-inkFaint font-mono">Memuat…</p>
      ) : productions.length === 0 ? (
        <p className="text-sm text-inkFaint font-mono">Belum ada produksi tercatat.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-inkFaint font-mono text-xs uppercase border-b border-paperLine">
                <th className="py-2 pr-4">Tanggal</th>
                <th className="py-2 pr-4">PO</th>
                <th className="py-2 pr-4">Style</th>
                <th className="py-2 pr-4">Body</th>
                <th className="py-2 pr-4">Size</th>
                <th className="py-2 pr-4 text-right">Qty</th>
                <th className="py-2 pr-4">Catatan</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {productions.map((p) => (
                <tr key={p.id} className="border-b border-paperLine/60">
                  <td className="py-2 pr-4 font-mono">{p.date}</td>
                  <td className="py-2 pr-4 font-mono text-inkSoft">{p.po || '—'}</td>
                  <td className="py-2 pr-4 font-mono">{p.style}</td>
                  <td className="py-2 pr-4">{p.body}</td>
                  <td className="py-2 pr-4 font-mono">{p.size}</td>
                  <td className="py-2 pr-4 font-mono tabular text-right">{p.qty}</td>
                  <td className="py-2 pr-4 text-inkSoft">{p.note || '—'}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-redpen text-xs font-mono hover:underline"
                    >
                      hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
