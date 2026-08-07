export const ROLES = ['IE', 'Record', 'Operator Segregasi', 'Operator Polibag', 'King']

// Aturan akses: tab mana yang boleh dibuka oleh level user apa.
// Catatan: key "production" & "packing" adalah nama internal tab (tidak berubah),
// tapi tampilan labelnya sudah diganti jadi "Segregasi" / "Polibag" (lihat TAB_LABELS).
export const TAB_PERMISSIONS = {
  dashboard: ['IE', 'Record', 'Operator Segregasi', 'Operator Polibag', 'King'],
  orders: ['IE', 'Record', 'King'],
  production: ['IE', 'Operator Segregasi', 'King'],
  packing: ['IE', 'Operator Polibag', 'King'],
  users: ['King'],
}

export const TAB_LABELS = {
  dashboard: { label: 'Ringkasan', code: '01' },
  orders: { label: 'Order', code: '02' },
  production: { label: 'Input Segregasi', code: '03' },
  packing: { label: 'Input Polibag', code: '04' },
  users: { label: 'Kelola User', code: '05' },
}

export function canAccess(role, tab) {
  return !!role && (TAB_PERMISSIONS[tab] || []).includes(role)
}

export function firstAllowedTab(role) {
  return Object.keys(TAB_PERMISSIONS).find((t) => canAccess(role, t)) || null
}
