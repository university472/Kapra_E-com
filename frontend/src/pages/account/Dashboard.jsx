import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Heart,
  MapPin,
  Package,
  ChevronRight,
  User,
  Clock
} from 'lucide-react'
import { orderAPI } from '../../api'
import { useAuthStore } from '../../stores/authStore'
import PageMeta from '../../components/shared/PageMeta'
import { formatPrice } from '../../lib/utils'
import { ORDER_STATUSES } from '../../constants'

const menuItems = [
  {
    to: '/account/orders',
    icon: ShoppingBag,
    label: 'My Orders',
    sub: 'Track & manage orders',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    to: '/account/wishlist',
    icon: Heart,
    label: 'Wishlist',
    sub: 'Saved items',
    color: 'bg-red-50 text-red-500'
  },
  {
    to: '/account/addresses',
    icon: MapPin,
    label: 'Addresses',
    sub: 'Saved delivery addresses',
    color: 'bg-green-50 text-green-600'
  },
  {
    to: '/track-order',
    icon: Package,
    label: 'Track Order',
    sub: 'Track by Order ID',
    color: 'bg-amber-50 text-amber-600'
  }
]

export default function Dashboard() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderAPI
      .getMyOrders({ limit: 3 })
      .then(({ data }) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageMeta title="My Account" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile header */}
        <div
          className="bg-white rounded-3xl border border-gray-100
                        shadow-sm p-6 mb-6"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 bg-gradient-to-br from-brand-400
                            to-brand-600 rounded-2xl flex items-center
                            justify-center shadow-md"
            >
              <span className="text-white font-display font-bold text-2xl">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="font-display font-bold text-xl text-gray-900">
                {user?.name}
              </h1>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              {user?.phone && (
                <p className="text-gray-400 text-xs mt-0.5">{user.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick links grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {menuItems.map(({ to, icon: Icon, label, sub, color }) => (
            <Link
              key={to}
              to={to}
              className="bg-white rounded-2xl border border-gray-100
                         shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5
                         transition-all flex flex-col gap-3"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center
                               justify-center ${color}`}
              >
                <Icon size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div
          className="bg-white rounded-3xl border border-gray-100
                        shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-lg text-gray-900">
              Recent Orders
            </h2>
            <Link
              to="/account/orders"
              className="text-sm text-brand-600 font-semibold
                         flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All
              <ChevronRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 shimmer rounded-xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10">
              <Clock size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500 text-sm">No orders yet</p>
              <Link
                to="/products"
                className="text-brand-600 text-sm font-semibold
                               hover:underline mt-1 block"
              >
                Start Shopping →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order._id}
                  to={`/account/orders/${order._id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl
                             border border-gray-100 hover:border-brand-200
                             hover:bg-brand-50/50 transition-all"
                >
                  {/* First product image */}
                  <img
                    src={
                      order.items?.[0]?.product?.images?.[0] ||
                      '/placeholder.png'
                    }
                    alt=""
                    className="w-12 h-14 object-cover rounded-xl
                               border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-gray-800 text-sm
                                  font-mono tracking-wide"
                    >
                      {order.orderId}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {order.items?.length} item
                      {order.items?.length !== 1 ? 's' : ''} ·{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-PK')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-1
                                      rounded-full
                                      ${
                                        ORDER_STATUSES[order.orderStatus]
                                          ?.color || 'bg-gray-100 text-gray-700'
                                      }`}
                    >
                      {ORDER_STATUSES[order.orderStatus]?.label ||
                        order.orderStatus}
                    </span>
                    <p className="text-sm font-bold text-brand-600 mt-1">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="h-20 sm:h-0" />
    </>
  )
}
