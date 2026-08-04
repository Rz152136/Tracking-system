export function keyOf(po, style, body, size) {
  return `${po}__${style}__${body}__${size}`
}

/**
 * Menggabungkan data order dan produksi menjadi satu baris ringkasan
 * per kombinasi PO + Style + Body + Size.
 *
 * selisih = totalProduksi - totalOrder
 *   selisih < 0  -> masih KURANG sebanyak |selisih| pcs (ditampilkan minus, merah)
 *   selisih >= 0 -> order sudah TERPENUHI (ditampilkan hijau)
 */
export function buildSummary(orders, productions) {
  const map = new Map()

  for (const o of orders) {
    const po = o.po || '(Tanpa PO)'
    const k = keyOf(po, o.style, o.body, o.size)
    if (!map.has(k)) {
      map.set(k, { po, style: o.style, body: o.body, size: o.size, orderQty: 0, producedQty: 0 })
    }
    map.get(k).orderQty += Number(o.qty) || 0
  }

  for (const p of productions) {
    const po = p.po || '(Tanpa PO)'
    const k = keyOf(po, p.style, p.body, p.size)
    if (!map.has(k)) {
      map.set(k, { po, style: p.style, body: p.body, size: p.size, orderQty: 0, producedQty: 0 })
    }
    map.get(k).producedQty += Number(p.qty) || 0
  }

  const rows = Array.from(map.values()).map((r) => ({
    ...r,
    selisih: r.producedQty - r.orderQty,
  }))

  rows.sort((a, b) => {
    if (a.po !== b.po) return a.po.localeCompare(b.po)
    if (a.style !== b.style) return a.style.localeCompare(b.style)
    if (a.body !== b.body) return a.body.localeCompare(b.body)
    return a.size.localeCompare(b.size, undefined, { numeric: true })
  })

  return rows
}

export function groupByStyle(rows) {
  const map = new Map()
  for (const r of rows) {
    if (!map.has(r.style)) map.set(r.style, [])
    map.get(r.style).push(r)
  }
  return Array.from(map.entries()).map(([style, items]) => ({
    style,
    items,
    totalOrder: items.reduce((s, i) => s + i.orderQty, 0),
    totalProduced: items.reduce((s, i) => s + i.producedQty, 0),
    totalSelisih: items.reduce((s, i) => s + i.selisih, 0),
  }))
}

/**
 * Mengelompokkan ringkasan berdasarkan PO. Setiap PO berisi beberapa style,
 * dan tiap style berisi breakdown body/size seperti biasa.
 *
 * status PO:
 *   isComplete = true   -> semua baris di dalam PO ini punya selisih >= 0 (order terpenuhi semua) -> "Selesai"
 *   isComplete = false  -> masih ada minimal 1 baris yang minus (kurang)
 */
export function groupByPO(rows) {
  const map = new Map()
  for (const r of rows) {
    if (!map.has(r.po)) map.set(r.po, [])
    map.get(r.po).push(r)
  }

  const groups = Array.from(map.entries()).map(([po, items]) => {
    const totalOrder = items.reduce((s, i) => s + i.orderQty, 0)
    const totalProduced = items.reduce((s, i) => s + i.producedQty, 0)
    const isComplete = items.length > 0 && items.every((i) => i.selisih >= 0)
    return {
      po,
      items,
      styles: groupByStyle(items),
      totalOrder,
      totalProduced,
      totalSelisih: totalProduced - totalOrder,
      isComplete,
      shortLines: items.filter((i) => i.selisih < 0).length,
    }
  })

  groups.sort((a, b) => {
    // PO yang belum selesai ditampilkan lebih dulu
    if (a.isComplete !== b.isComplete) return a.isComplete ? 1 : -1
    return a.po.localeCompare(b.po)
  })

  return groups
}
