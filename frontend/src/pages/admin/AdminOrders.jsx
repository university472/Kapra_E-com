import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  ChevronDown,
  Truck,
  Check,
  X,
  Eye,
  RefreshCw,
  Package
} from 'lucide-react'
import { adminAPI } from '../../api'
import PageMeta from '../../components/shared/PageMeta'
import { formatPrice } from '../../lib/utils'
import { ORDER_STATUSES } from '../../constants'
import { toast } from 'sonner'

const STATUS_FLOW = [
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled'
]

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [trackingInputs, setTrackingInputs] = useState({})

  const fetchOrders = (p = 1, q = search, s = statusFilter) => {
    setLoading(true)
    adminAPI
      .getOrders({
        page: p,
        limit: 20,
        search: q || undefined,
        status: s || undefined
      })
      .then(({ data }) => {
        setOrders(data.orders)
        setPagination(data.pagination)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      fetchOrders(1, search, statusFilter)
    }, 400)
    return () => clearTimeout(t)
  }, [search, statusFilter])

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingId(orderId)
    try {
      await adminAPI.updateOrderStatus(orderId, {
        status,
        trackingNumber: trackingInputs[orderId] || undefined
      })
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: status } : o))
      )
      toast.success(`Order status → ${status}`)
      setExpandedId(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleReturnDecision = async (orderId, decision) => {
    setUpdatingId(orderId)
    try {
      await adminAPI.handleReturn(orderId, { decision })
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? {
                ...o,
                returnRequest: {
                  ...o.returnRequest,
                  status: decision
                },
                orderStatus:
                  decision === 'approved' ? 'returned' : o.orderStatus
              }
            : o
        )
      )
      toast.success(`Return ${decision}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <>
      <PageMeta title="Admin — Orders" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Orders
          </h1>
          {pagination && (
            <p className="text-sm text-gray-500 mt-0.5">
              {pagination.total} total orders
            </p>
          )}
        </div>
        <button
          onClick={() => fetchOrders(page, search, statusFilter)}
          className="flex items-center gap-2 text-sm text-gray-500
                     hover:text-brand-600 border border-gray-200
                     px-4 py-2 rounded-xl transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Filters row */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2
                             text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, customer, phone..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200
                       rounded-xl text-sm bg-white focus:outline-none
                       focus:ring-2 focus:ring-brand-300 transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2.5 border border-gray-200 rounded-xl
                     text-sm bg-white focus:outline-none focus:ring-2
                     focus:ring-brand-300 transition-all"
        >
          <option value="">All Statuses</option>
          {STATUS_FLOW.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
          <option value="returned">returned</option>
        </select>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 shimmer rounded-2xl" />
          ))
        ) : orders.length === 0 ? (
          <div
            className="text-center py-20 bg-white rounded-2xl
                          border border-gray-100"
          >
            <Package size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedId === order._id
            const customerName =
              order.user?.name ||
              order.guestInfo?.name ||
              order.shippingAddress?.fullName ||
              'Guest'

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100
                            shadow-sm overflow-hidden"
              >
                {/* ── Summary row ────────────────────── */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer
                           hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order._id)}
                >
                  {/* Order ID */}
                  <div className="min-w-[130px]">
                    <p
                      className="font-bold text-sm font-mono
                                 tracking-wide text-gray-900"
                    >
                      {order.orderId}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-PK', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                  </div>

                  {/* Customer */}
                  <div className="flex-1 min-w-0 hidden sm:block">
                    <p
                      className="text-sm font-semibold text-gray-700
                                 truncate"
                    >
                      {customerName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.shippingAddress?.city}
                      {' · '}
                      {order.items?.length} item
                      {order.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Total */}
                  <p className="font-bold text-brand-600 text-sm shrink-0">
                    {formatPrice(order.total)}
                  </p>

                  {/* Status badge */}
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1
                                  rounded-full shrink-0
                                  ${
                                    ORDER_STATUSES[order.orderStatus]?.color ||
                                    'bg-gray-100 text-gray-700'
                                  }`}
                  >
                    {ORDER_STATUSES[order.orderStatus]?.label ||
                      order.orderStatus}
                  </span>

                  {/* Return indicator */}
                  {order.returnRequest?.requested && (
                    <span
                      className="text-[10px] bg-orange-100 text-orange-700
                                   font-bold px-2 py-0.5 rounded-full shrink-0"
                    >
                      Return {order.returnRequest.status}
                    </span>
                  )}

                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform shrink-0
                              ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>

                {/* ── Expanded detail ────────────────── */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Items */}
                      <div>
                        <p
                          className="text-xs font-bold text-gray-500 uppercase
                                     tracking-wide mb-3"
                        >
                          Order Items
                        </p>
                        <div className="space-y-2.5">
                          {order.items?.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <img
                                src={item.image || '/placeholder.png'}
                                alt={item.name}
                                className="w-10 h-12 object-cover rounded-lg
                                         border border-gray-100 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-xs font-semibold text-gray-800
                                             line-clamp-1"
                                >
                                  {item.name}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  ×{item.qty} · {formatPrice(item.price)}
                                </p>
                              </div>
                              <p className="text-xs font-bold text-brand-600 shrink-0">
                                {formatPrice(item.price * item.qty)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer + Address */}
                      <div className="space-y-3">
                        <div>
                          <p
                            className="text-xs font-bold text-gray-500 uppercase
                                       tracking-wide mb-1.5"
                          >
                            Shipping To
                          </p>
                          <div className="bg-gray-50 rounded-xl p-3 text-sm">
                            <p className="font-semibold text-gray-800">
                              {order.shippingAddress?.fullName}
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {order.shippingAddress?.street},{' '}
                              {order.shippingAddress?.city}
                            </p>
                            <p className="text-gray-500 text-xs">
                              📞 {order.shippingAddress?.phone}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Payment</span>
                          <span className="font-semibold">
                            {order.paymentMethod}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Total</span>
                          <span className="font-bold text-brand-600">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ── Status Update ─────────────── */}
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <p
                        className="text-xs font-bold text-gray-500 uppercase
                                   tracking-wide mb-3"
                      >
                        Update Status
                      </p>

                      {/* Tracking number input (for shipped status) */}
                      <div className="flex gap-2 mb-3">
                        <input
                          value={trackingInputs[order._id] || ''}
                          onChange={(e) =>
                            setTrackingInputs((t) => ({
                              ...t,
                              [order._id]: e.target.value
                            }))
                          }
                          placeholder="Tracking number (optional)"
                          className="flex-1 px-3 py-2 border border-gray-200
                                   rounded-xl text-xs bg-gray-50
                                   focus:outline-none focus:ring-1
                                   focus:ring-brand-300"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {STATUS_FLOW.filter((s) => s !== order.orderStatus).map(
                          (s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusUpdate(order._id, s)}
                              disabled={updatingId === order._id}
                              className={`px-3 py-1.5 rounded-xl text-xs
                                      font-bold transition-colors capitalize
                                      disabled:opacity-50
                                      ${
                                        s === 'cancelled'
                                          ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                          : s === 'delivered'
                                            ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                      }`}
                            >
                              {updatingId === order._id ? '…' : `→ ${s}`}
                            </button>
                          )
                        )}
                      </div>

                      {/* Return request */}
                      {order.returnRequest?.requested &&
                        order.returnRequest.status === 'pending' && (
                          <div
                            className="mt-4 bg-orange-50 border border-orange-200
                                      rounded-xl p-4"
                          >
                            <p className="text-xs font-bold text-orange-800 mb-1">
                              Return Request
                            </p>
                            <p className="text-xs text-orange-700 mb-3">
                              Reason: {order.returnRequest.reason}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleReturnDecision(order._id, 'approved')
                                }
                                disabled={updatingId === order._id}
                                className="flex items-center gap-1.5 px-4 py-1.5
                                       bg-green-500 text-white rounded-xl
                                       text-xs font-bold hover:bg-green-600
                                       transition-colors disabled:opacity-50"
                              >
                                <Check size={13} />
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleReturnDecision(order._id, 'rejected')
                                }
                                disabled={updatingId === order._id}
                                className="flex items-center gap-1.5 px-4 py-1.5
                                       bg-red-100 text-red-700 rounded-xl
                                       text-xs font-bold hover:bg-red-200
                                       transition-colors disabled:opacity-50"
                              >
                                <X size={13} />
                                Reject
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
            {' · '}
            {pagination.total} orders
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const p = page - 1
                setPage(p)
                fetchOrders(p, search, statusFilter)
              }}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm
                         disabled:opacity-40 hover:border-brand-300"
            >
              ← Prev
            </button>
            <button
              onClick={() => {
                const p = page + 1
                setPage(p)
                fetchOrders(p, search, statusFilter)
              }}
              disabled={!pagination.hasNext}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm
                         disabled:opacity-40 hover:border-brand-300"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </>
  )
}
