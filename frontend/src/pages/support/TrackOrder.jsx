import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCcw,
  MapPin
} from 'lucide-react'
import { orderAPI } from '../../api'
import PageMeta from '../../components/shared/PageMeta'
import { formatPrice } from '../../lib/utils'
import { ORDER_STATUSES } from '../../constants'

const schema = z.object({
  orderId: z.string().min(5, 'Enter your order ID (e.g. KPR-XXXXXXXX)'),
  phone: z.string().regex(/^0[0-9]{10}$/, 'Enter valid phone (03XXXXXXXXX)')
})

// Timeline step icons
const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle2,
  packed: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
  returned: RefreshCcw
}

export default function TrackOrder() {
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({ resolver: zodResolver(schema) })

  // Pre-fill from query params (coming from order confirmation)
  useEffect(() => {
    const id = searchParams.get('orderId')
    if (id) setValue('orderId', id)
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    setError(null)
    setOrder(null)
    try {
      const { data: res } = await orderAPI.track(data)
      setOrder(res)
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageMeta
        title="Track Your Order"
        description="Track your Kapra Store order status in real-time."
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 bg-brand-50 rounded-2xl
                          flex items-center justify-center mx-auto mb-4"
          >
            <Package size={32} className="text-brand-500" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Track Your Order
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Enter your Order ID and phone number to see real-time status
          </p>
        </div>

        {/* Search form */}
        <div
          className="bg-white rounded-3xl border border-gray-100
                        shadow-sm p-6 sm:p-8 mb-6"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                className="block text-sm font-semibold
                                 text-gray-700 mb-1.5"
              >
                Order ID
              </label>
              <input
                {...register('orderId')}
                placeholder="KPR-XXXXXXXX"
                className={`w-full px-4 py-3 rounded-xl border text-sm
                            bg-gray-50 focus:bg-white focus:outline-none
                            focus:ring-2 focus:ring-brand-300 transition-all
                            uppercase tracking-widest font-mono
                            ${
                              errors.orderId
                                ? 'border-red-300'
                                : 'border-gray-200'
                            }`}
              />
              {errors.orderId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.orderId.message}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-semibold
                                 text-gray-700 mb-1.5"
              >
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="03001234567"
                className={`w-full px-4 py-3 rounded-xl border text-sm
                            bg-gray-50 focus:bg-white focus:outline-none
                            focus:ring-2 focus:ring-brand-300 transition-all
                            ${
                              errors.phone
                                ? 'border-red-300'
                                : 'border-gray-200'
                            }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2
                         bg-brand-500 text-white font-bold py-3.5
                         rounded-xl hover:bg-brand-600 transition-colors
                         disabled:opacity-60 active:scale-95"
            >
              {loading ? (
                <span
                  className="w-5 h-5 border-2 border-white/30
                                 border-t-white rounded-full animate-spin"
                />
              ) : (
                <Search size={18} />
              )}
              {loading ? 'Searching…' : 'Track Order'}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 rounded-2xl
                          p-4 text-center text-red-700 text-sm font-medium mb-6"
          >
            ❌ {error}
          </div>
        )}

        {/* Order Result */}
        {order && (
          <div
            className="bg-white rounded-3xl border border-gray-100
                          shadow-sm overflow-hidden"
          >
            {/* Status header */}
            <div
              className={`p-5 flex items-center gap-4
                             ${
                               order.orderStatus === 'delivered'
                                 ? 'bg-green-50 border-b border-green-100'
                                 : order.orderStatus === 'cancelled'
                                   ? 'bg-red-50 border-b border-red-100'
                                   : 'bg-brand-50 border-b border-brand-100'
                             }`}
            >
              <div
                className="w-12 h-12 rounded-2xl bg-white/80
                              flex items-center justify-center shadow-sm"
              >
                {(() => {
                  const Icon = STATUS_ICONS[order.orderStatus] || Clock
                  return (
                    <Icon
                      size={24}
                      className={
                        order.orderStatus === 'delivered'
                          ? 'text-green-600'
                          : order.orderStatus === 'cancelled'
                            ? 'text-red-500'
                            : 'text-brand-500'
                      }
                    />
                  )
                })()}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Order ID</p>
                <p className="font-display font-bold text-lg text-gray-900">
                  {order.orderId}
                </p>
              </div>
              <div className="ml-auto">
                <span
                  className={`text-xs font-bold px-3 py-1.5
                                  rounded-full
                                  ${
                                    ORDER_STATUSES[order.orderStatus]?.color ||
                                    'bg-gray-100 text-gray-700'
                                  }`}
                >
                  {ORDER_STATUSES[order.orderStatus]?.label ||
                    order.orderStatus}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6">
              <h3 className="text-sm font-bold text-gray-800 mb-5">
                Order Progress
              </h3>
              <div className="space-y-0">
                {order.timeline?.map((step, i) => {
                  const Icon = STATUS_ICONS[step.status] || Clock
                  const isLast = i === order.timeline.length - 1
                  return (
                    <div key={step.status} className="flex gap-4">
                      {/* Icon + line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center
                                        justify-center border-2 transition-colors
                                        ${
                                          step.active
                                            ? 'border-brand-500 bg-brand-500 text-white'
                                            : step.completed
                                              ? 'border-green-500 bg-green-500 text-white'
                                              : 'border-gray-200 bg-white text-gray-300'
                                        }`}
                        >
                          <Icon size={16} />
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 h-8 mt-1
                                          ${
                                            step.completed
                                              ? 'bg-green-300'
                                              : 'bg-gray-200'
                                          }`}
                          />
                        )}
                      </div>
                      {/* Label */}
                      <div className="pb-8 pt-1.5">
                        <p
                          className={`text-sm font-semibold capitalize
                                       ${
                                         step.active
                                           ? 'text-brand-600'
                                           : step.completed
                                             ? 'text-gray-800'
                                             : 'text-gray-400'
                                       }`}
                        >
                          {step.status}
                        </p>
                        {step.active && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Current status
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Tracking number */}
              {order.trackingNumber && (
                <div
                  className="bg-blue-50 border border-blue-100
                                rounded-xl p-4 mt-2"
                >
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    Courier Tracking Number
                  </p>
                  <p className="font-bold text-blue-800 font-mono">
                    {order.trackingNumber}
                  </p>
                </div>
              )}
            </div>

            {/* Shipping address */}
            <div className="px-6 pb-5">
              <div
                className="flex items-start gap-3 bg-gray-50
                              rounded-xl p-4"
              >
                <MapPin size={16} className="text-brand-500 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">
                    {order.shippingAddress?.fullName}
                  </p>
                  <p className="text-gray-500 mt-0.5 leading-relaxed">
                    {order.shippingAddress?.street},{' '}
                    {order.shippingAddress?.city}
                    {order.shippingAddress?.province
                      ? `, ${order.shippingAddress.province}`
                      : ''}
                  </p>
                  <p className="text-gray-500">
                    {order.shippingAddress?.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Order total */}
            <div
              className="border-t border-gray-100 px-6 py-4
                            flex justify-between items-center"
            >
              <span className="text-sm text-gray-600">Order Total</span>
              <span className="font-display font-bold text-xl text-brand-600">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="h-20 sm:h-0" />
    </>
  )
}
