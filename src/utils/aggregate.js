export function keyOf(po, style, body, size) {
  return `${po}__${style}__${body}__${size}`
}

/**
 * Menggabungkan data order dengan data 1 tahap proses (produksi/washing/packing)
 * menjadi satu baris ringkasan per kombinasi PO + Style + Body + Size.
 *
 * selisih = totalDone - totalOrder
 *   selisih < 0  -> masih KURANG sebanyak |selisih| pcs (ditampilkan minus, merah)
 *   selisih >= 0 -> order sudah TERPENUHI di tahap ini (ditampilkan hijau)
 */
export function buildStageSummary(orders, entries) {
  const map = new Map()

  for (const o of orders) {
    const po = o.po || '(Tanpa PO)'
    const k = keyOf(po, o.style, o.body, o.size)
    if (!map.has(k)) {
      map.set(k, { po, style: o.style, body: o.body, size: o.size, orderQty: 0, doneQty: 0 })
    }
    map.get(k).orderQty += Number(o.qty) || 0
  }

  for (const e of entries) {
    const po = e.po || '(Tanpa PO)'
    const k = keyOf(po, e.style, e.body, e.size)
    if (!map.has(k)) {
      map.set(k, { po, style: e.style, body: e.body, size: e.size, orderQty: 0, doneQty: 0 })
    }
    map.get(k).doneQty += Number(e.qty) || 0
  }

  const rows = Array.from(map.values()).map((r) => ({
    ...r,
    selisih: r.doneQty - r.orderQty,
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
    totalDone: items.reduce((s, i) => s + i.doneQty, 0),
    totalSelisih: items.reduce((s, i) => s + i.selisih, 0),
  }))
}

/**
 * Mengelompokkan ringkasan 1 tahap berdasarkan PO.
 * isComplete = true -> semua baris di PO ini, di tahap ini, selisih >= 0.
 */
export function groupByPO(rows) {
  const map = new Map()
  for (const r of rows) {
    if (!map.has(r.po)) map.set(r.po, [])
    map.get(r.po).push(r)
  }

  const groups = Array.from(map.entries()).map(([po, items]) => {
    const totalOrder = items.reduce((s, i) => s + i.orderQty, 0)
    const totalDone = items.reduce((s, i) => s + i.doneQty, 0)
    const isComplete = items.length > 0 && items.every((i) => i.selisih >= 0)
    return {
      po,
      items,
      styles: groupByStyle(items),
      totalOrder,
      totalDone,
      totalSelisih: totalDone - totalOrder,
      isComplete,
      shortLines: items.filter((i) => i.selisih < 0).length,
    }
  })

  groups.sort((a, b) => {
    if (a.isComplete !== b.isComplete) return a.isComplete ? 1 : -1
    return a.po.localeCompare(b.po)
  })

  return groups
}

export function poListFromOrders(orders) {
  return Array.from(new Set(orders.map((o) => o.po || '(Tanpa PO)'))).sort()
}

/**
 * WIP (Work In Progress) = qty yang sudah diproduksi tapi BELUM di-packing.
 * wip = producedQty - packedQty
 *   wip > 0  -> masih ada barang "mengendap" di antara Produksi dan Packing
 *   wip = 0  -> semua yang sudah diproduksi sudah selesai di-packing juga
 *   wip < 0  -> packing lebih besar dari produksi (kemungkinan salah input, perlu dicek)
 */
export function buildWipRows(productionItems, packingItems) {
  const packMap = new Map()
  for (const item of packingItems) {
    packMap.set(keyOf(item.po, item.style, item.body, item.size), item.doneQty)
  }
  return productionItems.map((item) => {
    const packedQty = packMap.get(keyOf(item.po, item.style, item.body, item.size)) || 0
    return {
      po: item.po,
      style: item.style,
      body: item.body,
      size: item.size,
      producedQty: item.doneQty,
      packedQty,
      wip: item.doneQty - packedQty,
    }
  })
}

export function groupWipByStyle(rows) {
  const map = new Map()
  for (const r of rows) {
    if (!map.has(r.style)) map.set(r.style, [])
    map.get(r.style).push(r)
  }
  return Array.from(map.entries()).map(([style, items]) => ({
    style,
    items,
    totalProduced: items.reduce((s, i) => s + i.producedQty, 0),
    totalPacked: items.reduce((s, i) => s + i.packedQty, 0),
    totalWip: items.reduce((s, i) => s + i.wip, 0),
  }))
}
