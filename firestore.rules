import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import OrdersPage from './components/OrdersPage'
import ProductionPage from './components/ProductionPage'
import UsersPage from './components/UsersPage'
import { useCollection } from './hooks/useCollection'
import { canAccess, firstAllowedTab } from './utils/permissions'

const TITLES = {
  dashboard: 'Ringkasan Produksi',
  orders: 'Data Order',
  production: 'Input Produksi',
  users: 'Kelola User',
}

const DESCRIPTIONS = {
  dashboard:
    'Perbandingan order vs hasil produksi per PO, Style, Body, dan Size. Angka merah menandai kekurangan.',
  orders: 'Catat detail order per PO, Style, Body, dan Size.',
  production: 'Catat hasil produksi harian sesuai kombinasi PO, Style, Body, dan Size.',
  users: 'Tambah user baru dan atur level akses tiap user.',
}

function AppShell() {
  const { user, role, name, loading, logout } = useAuth()
  const [tab, setTab] = useState(null)
  const { data: orders, loading: loadingOrders } = useCollection('orders')
  const { data: productions, loading: loadingProductions } = useCollection('productions')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-inkFaint font-mono text-sm">
        Memuat…
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 text-center">
        <div>
          <p className="font-display text-lg text-ink uppercase mb-2">Akses Belum Diatur</p>
          <p className="text-sm text-inkSoft mb-4 max-w-sm">
            Akun Anda sudah bisa login, tapi belum diberi level akses (IE/Record/Operator/King).
            Hubungi King untuk mengatur level akses Anda.
          </p>
          <button onClick={logout} className="text-xs font-mono text-redpen hover:underline">
            Keluar
          </button>
        </div>
      </div>
    )
  }

  const activeTab = tab && canAccess(role, tab) ? tab : firstAllowedTab(role)

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar
        active={activeTab}
        onChange={setTab}
        role={role}
        name={name}
        email={user.email}
        onLogout={logout}
      />
      <main className="flex-1 p-5 md:p-8 max-w-6xl">
        <header className="mb-6">
          <h1 className="font-display text-2xl uppercase tracking-wide text-ink">
            {TITLES[activeTab]}
          </h1>
          <p className="text-sm text-inkSoft mt-1">{DESCRIPTIONS[activeTab]}</p>
        </header>

        {activeTab === 'dashboard' && (
          <Dashboard
            orders={orders}
            productions={productions}
            loading={loadingOrders || loadingProductions}
          />
        )}
        {activeTab === 'orders' && <OrdersPage orders={orders} loading={loadingOrders} />}
        {activeTab === 'production' && (
          <ProductionPage
            orders={orders}
            productions={productions}
            loading={loadingProductions}
          />
        )}
        {activeTab === 'users' && <UsersPage />}

        <footer className="mt-10 pt-4 border-t border-paperLine text-center">
          <p className="text-xs font-mono text-inkFaint tracking-wide">
            © {new Date().getFullYear()} Rizqi IE
          </p>
        </footer>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
