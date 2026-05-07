import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ChevronRight, Clock, Package, Filter } from 'lucide-react'
import { orderAPI } from '../../api'
import PageMeta from '../../components/shared/PageMeta'
import Pagination from '../../components/ui/Pagination'
import { formatPrice } from '../../lib/utils'
import { ORDER_STATUSES } from '../../constants'

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
]

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    orderAPI
      .getMyOrders({
        page,
        limit: 10,
        status: activeTab || undefined
      })
      .then(({ data }) => {
        setOrders(data.orders)
        setPagination(data.pagination)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeTab, page])

  const handleTabChange = (val) => {
    setActiveTab(val)
    setPage(1)
  }

  return (
    <>
      <PageMeta title="My Orders" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingBag className="text-brand-500" size={24} />
          <h1 className="font-display text-2xl font-bold text-gray-900">
            My Orders
          </h1>
          {pagination?.total > 0 && (
            <span
              className="bg-brand-100 text-brand-700 text-sm
                             font-bold px-2.5 py-0.5 rounded-full"
            >
              {pagination.total}
            </span>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 pb-1">
          {STATUS_TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleTabChange(value)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm
                          font-semibold transition-colors
                          ${
                            activeTab === value
                              ? 'bg-brand-500 text-white'
                              : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
                          }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 shimmer rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div
            className="text-center py-20 bg-white rounded-3xl
                          border border-gray-100"
          >
            <Package size={56} className="mx-auto text-gray-200 mb-4" />
            <p className="text-lg font-bold text-gray-800 mb-1">
              No orders found
            </p>
            <p className="text-gray-500 text-sm mb-5">
              {activeTab
                ? `No ${activeTab} orders`
                : "You haven't placed any orders yet"}
            </p>
            <Link
              to="/products"
              className="bg-brand-500 text-white px-6 py-2.5
                         rounded-full text-sm font-bold
                         hover:bg-brand-600 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order._id}
                  to={`/account/orders/${order._id}`}
                  className="block bg-white rounded-2xl border border-gray-100
                             shadow-sm hover:shadow-md hover:border-brand-200
                             transition-all overflow-hidden"
                >
                  {/* Status bar */}
                  <div
                    className={`h-1.5
                                   ${
                                     ORDER_STATUSES[
                                       order.orderStatus
                                     ]?.color?.includes('green')
                                       ? 'bg-green-400'
                                       : ORDER_STATUSES[
                                             order.orderStatus
                                           ]?.color?.includes('red')
                                         ? 'bg-red-400'
                                         : 'bg-brand-400'
                                   }`}
                  />

                  <div className="p-4 flex items-center gap-4">
                    {/* Images stack */}
                    <div className="flex -space-x-2 shrink-0">
                      {order.items?.slice(0, 3).map((item, i) => (
                        <img
                          key={i}
                          src={item.product?.images?.[0] || '/placeholder.png'}
                          alt=""
                          className="w-12 h-14 object-cover rounded-lg
                                     border-2 border-white shadow-sm"
                          style={{ zIndex: 3 - i }}
                        />
                      ))}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p
                            className="font-bold text-gray-800 text-sm
                                        font-mono tracking-wide"
                          >
                            {order.orderId}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {order.items?.length} item
                            {order.items?.length !== 1 ? 's' : ''}
                            {' · '}
                            {new Date(order.createdAt).toLocaleDateString(
                              'en-PK',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              }
                            )}
                          </p>
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-gray-400 mt-1 shrink-0"
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-1
                                          rounded-full
                                          ${
                                            ORDER_STATUSES[order.orderStatus]
                                              ?.color ||
                                            'bg-gray-100 text-gray-700'
                                          }`}
                        >
                          {ORDER_STATUSES[order.orderStatus]?.label ||
                            order.orderStatus}
                        </span>
                        <p className="font-bold text-brand-600 text-sm">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pagination && (
              <Pagination pagination={pagination} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
      <div className="h-20 sm:h-0" />
    </>
  )
}
