import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  Store
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { toast } from 'sonner'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/users', label: 'Users', icon: Users }
]

export default function AdminLayout() {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className="w-60 bg-white border-r border-gray-200
                        flex flex-col fixed h-full z-40 shadow-sm"
      >
        {/* Brand */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Store className="text-brand-500" size={22} />
            <div>
              <p className="font-display font-bold text-brand-700 leading-none">
                Kapra Store
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg
                 text-sm font-medium transition-colors
                 ${
                   isActive
                     ? 'bg-brand-50 text-brand-600 font-semibold'
                     : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                 }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-3 px-2">
            Logged in as <strong>{user?.name}</strong>
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg
                       w-full text-sm text-red-500 hover:bg-red-50
                       transition-colors font-medium"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
