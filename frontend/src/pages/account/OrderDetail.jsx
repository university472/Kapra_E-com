import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Package,
  MapPin,
  Truck,
  Banknote,
  RefreshCcw,
  XCircle,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Download // ← ADDED
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { orderAPI } from '../../api'
import api from '../../api/axios' // ← ADDED (for blob download)
import PageMeta from '../../components/shared/PageMeta'
import { formatPrice } from '../../lib/utils'
import { ORDER_STATUSES } from '../../constants'
import { toast } from 'sonner'

const returnSchema = z.object({
  reason: z
    .string()
    .min(10, 'Please describe the reason (at least 10 characters)')
})

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReturnForm, setShowReturnForm] = useState(false)
  const [submittingReturn, setSubmittingReturn] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: zodResolver(returnSchema) })

  // ── ADDED: Invoice download handler ──────────────────────
  const handleDownloadInvoice = async () => {
    try {
      const response = await api.get(`/orders/${id}/invoice`, {
        responseType: 'blob'
      })
      const url = URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `Invoice-${order.orderId}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error('Could not download invoice')
    }
  }

  const fetchOrder = () => {
    orderAPI
      .getById(id)
      .then(({ data }) => setOrder(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return
    setCancelling(true)
    try {
      await orderAPI.cancel(id)
      toast.success('Order cancelled')
      fetchOrder()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const handleReturn = async (data) => {
    setSubmittingReturn(true)
    try {
      await orderAPI.return(id, data)
      toast.success('Return request submitted!')
      setShowReturnForm(false)
      fetchOrder()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit return')
    } finally {
      setSubmittingReturn(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 shimmer rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Order not found</p>
        <Link
          to="/account/orders"
          className="text-brand-600 font-semibold text-sm mt-2 block"
        >
          ← Back to Orders
        </Link>
      </div>
    )
  }

  const canCancel = order.orderStatus === 'pending'
  const canReturn =
    order.orderStatus === 'delivered' && !order.returnRequest?.requested

  return (
    <>
      <PageMeta title={`Order ${order.orderId}`} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link
          to="/account/orders"
          className="flex items-center gap-1.5 text-sm text-gray-500
                         hover:text-brand-600 transition-colors mb-5"
        >
          <ChevronLeft size={16} />
          Back to Orders
        </Link>

        {/* Header card */}
        <div
          className="bg-white rounded-3xl border border-gray-100
                        shadow-sm p-6 mb-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Order ID</p>
              <p
                className="font-display font-bold text-xl text-gray-900
                             font-mono tracking-wide"
              >
                {order.orderId}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-PK', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full
                              ${
                                ORDER_STATUSES[order.orderStatus]?.color ||
                                'bg-gray-100 text-gray-700'
                              }`}
            >
              {ORDER_STATUSES[order.orderStatus]?.label || order.orderStatus}
            </span>
          </div>

          {/* Action buttons (including invoice) */}
          <div className="flex gap-3 mt-5 flex-wrap">
            {/* ── ADDED: Download Invoice button ────────────── */}
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                         border border-gray-200 text-sm font-semibold
                         text-gray-700 hover:border-brand-300
                         hover:text-brand-600 transition-colors"
            >
              <Download size={15} />
              Download Invoice
            </button>

            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                           border-2 border-red-300 text-red-500 text-sm
                           font-semibold hover:bg-red-50 transition-colors
                           disabled:opacity-50"
              >
                <XCircle size={15} />
                {cancelling ? 'Cancelling…' : 'Cancel Order'}
              </button>
            )}
            {canReturn && (
              <button
                onClick={() => setShowReturnForm(!showReturnForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                           border-2 border-amber-300 text-amber-600 text-sm
                           font-semibold hover:bg-amber-50 transition-colors"
              >
                <RefreshCcw size={15} />
                Request Return
              </button>
            )}
            {order.returnRequest?.requested && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                              bg-blue-50 border border-blue-200
                              text-blue-700 text-sm font-medium"
              >
                <AlertCircle size={15} />
                Return {order.returnRequest.status}
              </div>
            )}
          </div>

          {/* Return form (unchanged) */}
          {showReturnForm && (
            <div
              className="mt-4 bg-amber-50 border border-amber-200
                            rounded-2xl p-5"
            >
              <h3 className="font-bold text-sm text-amber-900 mb-3">
                Why are you returning this order?
              </h3>
              <form onSubmit={handleSubmit(handleReturn)}>
                <textarea
                  {...register('reason')}
                  rows={3}
                  placeholder="Describe the issue (wrong item, size, color, damage, etc.)"
                  className="w-full px-4 py-3 rounded-xl border border-amber-200
                             text-sm bg-white focus:outline-none focus:ring-2
                             focus:ring-amber-300 resize-none"
                />
                {errors.reason && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.reason.message}
                  </p>
                )}
                <div className="flex gap-3 mt-3">
                  <button
                    type="submit"
                    disabled={submittingReturn}
                    className="flex-1 bg-amber-500 text-white py-2.5
                               rounded-xl text-sm font-bold hover:bg-amber-600
                               transition-colors disabled:opacity-50"
                  >
                    {submittingReturn ? 'Submitting…' : 'Submit Return'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReturnForm(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200
                               text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Order items, shipping, payment, tracking - unchanged */}
        <div
          className="bg-white rounded-3xl border border-gray-100
                        shadow-sm p-6 mb-4"
        >
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={18} className="text-brand-500" />
            Order Items ({order.items?.length})
          </h2>
          <div className="space-y-4">
            {order.items?.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 pb-4 border-b border-gray-50
                              last:border-0 last:pb-0"
              >
                <img
                  src={
                    item.image ||
                    item.product?.images?.[0] ||
                    '/placeholder.png'
                  }
                  alt={item.name}
                  className="w-16 h-20 object-cover rounded-xl border
                             border-gray-100 shrink-0"
                />
                <div className="flex-1">
                  <p
                    className="font-semibold text-sm text-gray-800
                                 line-clamp-2"
                  >
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Qty: {item.qty} × {formatPrice(item.price)}
                  </p>
                  <p className="font-bold text-brand-600 text-sm mt-1">
                    {formatPrice(item.price * item.qty)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div
            className="bg-white rounded-2xl border border-gray-100
                          shadow-sm p-5"
          >
            <h3
              className="font-bold text-sm text-gray-800 mb-3
                           flex items-center gap-2"
            >
              <MapPin size={15} className="text-brand-500" />
              Shipping Address
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed">
              <p className="font-semibold text-gray-800">
                {order.shippingAddress?.fullName}
              </p>
              <p>{order.shippingAddress?.street}</p>
              <p>
                {order.shippingAddress?.city}
                {order.shippingAddress?.province
                  ? `, ${order.shippingAddress.province}`
                  : ''}
              </p>
              <p className="text-gray-500 mt-1">
                {order.shippingAddress?.phone}
              </p>
            </div>
          </div>

          <div
            className="bg-white rounded-2xl border border-gray-100
                          shadow-sm p-5"
          >
            <h3
              className="font-bold text-sm text-gray-800 mb-3
                           flex items-center gap-2"
            >
              <Banknote size={15} className="text-brand-500" />
              Payment Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span
                  className={order.shippingFee === 0 ? 'text-green-600' : ''}
                >
                  {order.shippingFee === 0
                    ? 'FREE'
                    : formatPrice(order.shippingFee)}
                </span>
              </div>
              <div
                className="border-t border-gray-100 pt-2 flex
                              justify-between font-bold text-gray-900"
              >
                <span>Total</span>
                <span className="text-brand-600">
                  {formatPrice(order.total)}
                </span>
              </div>
              <div
                className="mt-3 bg-green-50 rounded-xl px-3 py-2
                              flex items-center gap-2"
              >
                <CheckCircle2 size={14} className="text-green-600" />
                <span className="text-xs font-semibold text-green-700">
                  {order.paymentMethod === 'COD'
                    ? 'Cash on Delivery'
                    : order.paymentMethod}
                </span>
              </div>
            </div>
          </div>
        </div>

        {order.trackingNumber && (
          <div
            className="bg-blue-50 border border-blue-200
                          rounded-2xl p-4 flex items-center gap-3"
          >
            <Truck size={20} className="text-blue-600 shrink-0" />
            <div>
              <p className="text-xs text-blue-600 font-medium">
                Courier Tracking Number
              </p>
              <p className="font-bold text-blue-800 font-mono">
                {order.trackingNumber}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="h-20 sm:h-0" />
    </>
  )
}
