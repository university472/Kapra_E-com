import { useState, useEffect } from 'react'
import {
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  BarChart3
} from 'lucide-react'
import { adminAPI } from '../../api'
import PageMeta from '../../components/shared/PageMeta'
import { formatPrice } from '../../lib/utils'
import { ORDER_STATUSES } from '../../constants'

// ── Mini bar chart (pure CSS) ─────────────────────────────
function RevenueBar({ day, max }) {
  const pct = max > 0 ? (day.revenue / max) * 100 : 0
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-[9px] text-gray-400 font-medium">
        {formatPrice(day.revenue).replace('Rs. ', '')}
      </span>
      <div
        className="w-full bg-gray-100 rounded-t-md relative"
        style={{ height: '80px' }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 bg-brand-400
                     rounded-t-md transition-all duration-700"
          style={{ height: `${pct}%` }}
        />
      </div>
      <span className="text-[9px] text-gray-400 font-medium">
        {day._id?.slice(5)}
      </span>
    </div>
  )
}

// ── KPI Card ─────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100
                    shadow-sm p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-xl flex items-center
                         justify-center ${color}`}
        >
          <Icon size={22} strokeWidth={1.8} />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-0.5 text-xs font-bold
                           ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}
          >
            {trend >= 0 ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-gray-900">{value}</p>
        <p className="text-sm font-semibold text-gray-600 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = () => {
    setLoading(true)
    adminAPI
      .getDashboard()
      .then(({ data: d }) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading) return <DashboardSkeleton />
  if (!data) return null

  const {
    overview,
    ordersByStatus,
    revenueByDay,
    topProducts,
    lowStockProducts
  } = data
  const maxRevenue = Math.max(...(revenueByDay?.map((d) => d.revenue) || [1]))

  const statusIcons = {
    pending: { icon: Clock, color: 'text-yellow-500' },
    confirmed: { icon: CheckCircle2, color: 'text-blue-500' },
    packed: { icon: Package, color: 'text-purple-500' },
    shipped: { icon: Truck, color: 'text-indigo-500' },
    delivered: { icon: CheckCircle2, color: 'text-green-600' },
    cancelled: { icon: XCircle, color: 'text-red-500' }
  }

  return (
    <>
      <PageMeta title="Admin Dashboard" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-PK', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 text-sm text-gray-500
                     hover:text-brand-600 border border-gray-200
                     px-4 py-2 rounded-xl hover:border-brand-300
                     transition-colors"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* ── KPI Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          icon={ShoppingBag}
          label="Total Orders"
          value={overview.totalOrders.toLocaleString()}
          sub={`+${overview.todayOrders} today`}
          color="bg-blue-50 text-blue-600"
        />
        <KPICard
          icon={TrendingUp}
          label="Total Revenue"
          value={formatPrice(overview.totalRevenue)}
          sub={`${formatPrice(overview.todayRevenue)} today`}
          color="bg-green-50 text-green-600"
        />
        <KPICard
          icon={Users}
          label="Customers"
          value={overview.totalUsers.toLocaleString()}
          sub={`+${overview.newUsersToday} today`}
          color="bg-purple-50 text-purple-600"
        />
        <KPICard
          icon={Package}
          label="Products"
          value={overview.totalProducts.toLocaleString()}
          sub={
            overview.lowStockCount > 0
              ? `⚠️ ${overview.lowStockCount} low stock`
              : 'All stocked'
          }
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* ── Revenue Chart + Order Status ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Revenue last 7 days */}
        <div
          className="lg:col-span-2 bg-white rounded-2xl border
                        border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-gray-900">
                Revenue — Last 7 Days
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                From delivered orders
              </p>
            </div>
            <BarChart3 size={20} className="text-gray-300" />
          </div>

          {revenueByDay?.length > 0 ? (
            <div className="flex items-end gap-2 h-28">
              {revenueByDay.map((day) => (
                <RevenueBar key={day._id} day={day} max={maxRevenue} />
              ))}
            </div>
          ) : (
            <div
              className="h-28 flex items-center justify-center
                            text-gray-400 text-sm"
            >
              No revenue data yet
            </div>
          )}
        </div>

        {/* Order status breakdown */}
        <div
          className="bg-white rounded-2xl border border-gray-100
                        shadow-sm p-6"
        >
          <h2 className="font-display font-bold text-gray-900 mb-5">
            Orders by Status
          </h2>
          <div className="space-y-3">
            {Object.entries(ordersByStatus || {}).map(([status, count]) => {
              const { icon: Icon, color } = statusIcons[status] || {
                icon: Package,
                color: 'text-gray-500'
              }
              const total = overview.totalOrders || 1
              const pct = Math.round((count / total) * 100)
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={color} />
                      <span className="text-xs font-semibold text-gray-700 capitalize">
                        {status}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-600">
                      {count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all
                                  ${color.replace('text-', 'bg-')}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {Object.keys(ordersByStatus || {}).length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                No orders yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Top Products + Low Stock ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top selling products */}
        <div
          className="bg-white rounded-2xl border border-gray-100
                        shadow-sm p-6"
        >
          <h2 className="font-display font-bold text-gray-900 mb-5">
            🏆 Top Selling Products
          </h2>
          {topProducts?.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span
                    className="text-sm font-bold text-gray-300
                                   w-5 shrink-0"
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold text-gray-800
                                   line-clamp-1"
                    >
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {p.totalSold} units sold
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-brand-600">
                      {formatPrice(p.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">
              No sales data yet
            </p>
          )}
        </div>

        {/* Low stock alerts */}
        <div
          className="bg-white rounded-2xl border border-gray-100
                        shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="font-display font-bold text-gray-900">
              Low Stock Alerts
            </h2>
          </div>
          {lowStockProducts?.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center gap-3 p-3
                                bg-amber-50 rounded-xl border
                                border-amber-100"
                >
                  <img
                    src={p.images?.[0] || '/placeholder.png'}
                    alt={p.name}
                    className="w-10 h-12 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold text-gray-800
                                   line-clamp-1"
                    >
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {p.fabricType}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1
                                    rounded-full shrink-0
                                    ${
                                      p.stock === 0
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}
                  >
                    {p.stock === 0 ? 'Out!' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center
                            py-8 text-center"
            >
              <CheckCircle2 size={40} className="text-green-300 mb-2" />
              <p className="text-sm text-gray-500">
                All products are well-stocked!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 shimmer rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-56 shimmer rounded-2xl" />
        <div className="h-56 shimmer rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-64 shimmer rounded-2xl" />
        <div className="h-64 shimmer rounded-2xl" />
      </div>
    </div>
  )
}
