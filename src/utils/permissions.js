export const ROLES = ['IE', 'Record', 'Operator Produksi', 'Operator Packing', 'King']

// Aturan akses: tab mana yang boleh dibuka oleh level user apa.
export const TAB_PERMISSIONS = {
  dashboard: ['IE', 'Record', 'Operator Produksi', 'Operator Packing', 'King'],
  orders: ['IE', 'Record', 'King'],
  production: ['IE', 'Operator Produksi', 'King'],
  packing: ['IE', 'Operator Packing', 'King'],
  users: ['King'],
}

export const TAB_LABELS = {
  dashboard: { label: 'Ringkasan', code: '01' },
  orders: { label: 'Order', code: '02' },
  production: { label: 'Input Produksi', code: '03' },
  packing: { label: 'Input Packing', code: '04' },
  users: { label: 'Kelola User', code: '05' },
}

export function canAccess(role, tab) {
  return !!role && (TAB_PERMISSIONS[tab] || []).includes(role)
}

export function firstAllowedTab(role) {
  return Object.keys(TAB_PERMISSIONS).find((t) => canAccess(role, t)) || null
}
