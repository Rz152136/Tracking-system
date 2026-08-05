import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

export default function StageList({ collectionName, stageLabel, entries, loading }) {
  async function handleDelete(id) {
    if (!confirm(`Hapus data ${stageLabel.toLowerCase()} ini?`)) return
    await deleteDoc(doc(db, collectionName, id))
  }

  return (
    <div className="bg-white/70 border border-paperLine rounded-sm p-5 mt-6">
      <div className="font-display uppercase tracking-wide text-ink text-sm mb-4 pb-2 border-b border-paperLine">
        Riwayat {stageLabel}
      </div>
      {loading ? (
        <p className="text-sm text-inkFaint font-mono">Memuat…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-inkFaint font-mono">Belum ada data {stageLabel.toLowerCase()}.</p>
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
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-paperLine/60">
                  <td className="py-2 pr-4 font-mono">{e.date}</td>
                  <td className="py-2 pr-4 font-mono text-inkSoft">{e.po || '—'}</td>
                  <td className="py-2 pr-4 font-mono">{e.style}</td>
                  <td className="py-2 pr-4">{e.body}</td>
                  <td className="py-2 pr-4 font-mono">{e.size}</td>
                  <td className="py-2 pr-4 font-mono tabular text-right">{e.qty}</td>
                  <td className="py-2 pr-4 text-inkSoft">{e.note || '—'}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => handleDelete(e.id)}
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
