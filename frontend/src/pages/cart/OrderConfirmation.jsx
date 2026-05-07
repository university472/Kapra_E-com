import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import {
  CheckCircle2,
  Package,
  Phone,
  Home,
  ClipboardList,
  // ArrowRight,
  Truck,
  Banknote
} from 'lucide-react'
import { orderAPI } from '../../api'
import { useAuthStore } from '../../stores/authStore'
import PageMeta from '../../components/shared/PageMeta'
import { formatPrice } from '../../lib/utils'
import { WHATSAPP_NUMBER } from '../../constants'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()
  const stateData = location.state

  const [order, setOrder] = useState(null)
  const [ setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo({ top: 0 })
    if (isAuthenticated()) {
      // Try to find the order by orderId from user's orders
      orderAPI
        .getMyOrders({ limit: 5 })
        .then(({ data }) => {
          const found = data.orders.find((o) => o.orderId === orderId)
          if (found) setOrder(found)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [orderId])

  const total = order?.total ?? stateData?.total
  const paymentMethod =
    order?.paymentMethod ?? stateData?.paymentMethod ?? 'COD'

  return (
    <>
      <PageMeta title="Order Confirmed!" />
      <div
        className="min-h-screen bg-cream flex items-center
                      justify-center px-4 py-12"
      >
        <div className="w-full max-w-lg">
          {/* Success Card */}
          <div
            className="bg-white rounded-3xl shadow-sm border
                          border-gray-100 overflow-hidden"
          >
            {/* Green header */}
            <div
              className="bg-gradient-to-br from-green-400 to-green-600
                            p-10 text-center text-white"
            >
              <div
                className="w-20 h-20 bg-white/20 rounded-full
                              flex items-center justify-center mx-auto mb-4
                              animate-bounce"
              >
                <CheckCircle2 size={44} className="text-white" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-2">
                Order Confirmed!
              </h1>
              <p className="text-green-100 text-sm">
                Thank you for shopping with Kapra Store 🛍️
              </p>
            </div>

            {/* Order ID */}
            <div className="px-6 py-5 border-b border-gray-100 text-center">
              <p className="text-xs text-gray-500 font-medium mb-1">
                Your Order ID
              </p>
              <div
                className="inline-flex items-center gap-2 bg-brand-50
                              border border-brand-200 rounded-xl px-5 py-2"
              >
                <Package size={18} className="text-brand-500" />
                <span
                  className="font-display font-bold text-xl
                                 text-brand-700 tracking-wider"
                >
                  {orderId}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Save this ID to track your order
              </p>
            </div>

            {/* Details */}
            <div className="px-6 py-5 space-y-4">
              {/* Total */}
              {total && (
                <div
                  className="flex items-center justify-between
                                bg-gray-50 rounded-xl p-4"
                >
                  <span className="text-sm font-semibold text-gray-700">
                    Order Total
                  </span>
                  <span
                    className="font-display font-bold text-xl
                                   text-brand-600"
                  >
                    {formatPrice(total)}
                  </span>
                </div>
              )}

              {/* Payment */}
              <div
                className="flex items-center gap-3 bg-green-50
                              border border-green-100 rounded-xl p-4"
              >
                <Banknote className="text-green-600 shrink-0" size={22} />
                <div>
                  <p className="font-semibold text-sm text-green-800">
                    {paymentMethod === 'COD'
                      ? 'Cash on Delivery'
                      : paymentMethod}
                  </p>
                  {paymentMethod === 'COD' && (
                    <p className="text-xs text-green-600">
                      Pay when your fabric arrives at your door
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery info */}
              <div
                className="flex items-center gap-3 bg-blue-50
                              border border-blue-100 rounded-xl p-4"
              >
                <Truck className="text-blue-600 shrink-0" size={22} />
                <div>
                  <p className="font-semibold text-sm text-blue-800">
                    Estimated Delivery
                  </p>
                  <p className="text-xs text-blue-600">
                    3-7 business days across Pakistan
                  </p>
                </div>
              </div>

              {/* What's next */}
              <div
                className="bg-amber-50 border border-amber-100
                              rounded-xl p-4"
              >
                <p className="font-semibold text-sm text-amber-800 mb-2">
                  📋 What Happens Next?
                </p>
                <ol className="space-y-1.5">
                  {[
                    "We'll confirm your order within 1-2 hours",
                    'Your fabric will be carefully packed',
                    'Handed to courier (TCS / Leopard)',
                    'Delivered to your door 🚚'
                  ].map((step, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs
                                   text-amber-700"
                    >
                      <span
                        className="w-4 h-4 bg-amber-200 text-amber-800
                                       rounded-full flex items-center
                                       justify-center font-bold shrink-0
                                       text-[10px] mt-0.5"
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 space-y-3">
              <Link
                to={`/track-order?orderId=${orderId}`}
                className="flex items-center justify-center gap-2
                           w-full bg-brand-500 text-white font-bold
                           py-3.5 rounded-xl hover:bg-brand-600
                           transition-colors"
              >
                <ClipboardList size={18} />
                Track My Order
              </Link>

              {isAuthenticated() && (
                <Link
                  to="/account/orders"
                  className="flex items-center justify-center gap-2
                             w-full border-2 border-brand-500 text-brand-600
                             font-bold py-3.5 rounded-xl
                             hover:bg-brand-50 transition-colors"
                >
                  <Package size={18} />
                  View All Orders
                </Link>
              )}

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hello! I just placed order #${orderId}. Can you confirm receipt?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2
                           w-full bg-[#25D366] text-white font-semibold
                           py-3 rounded-xl hover:bg-[#1dbb57]
                           transition-colors text-sm"
              >
                <Phone size={16} />
                Confirm via WhatsApp
              </a>

              <Link
                to="/"
                className="flex items-center justify-center gap-2
                           w-full text-gray-500 font-medium py-2
                           hover:text-brand-600 transition-colors text-sm"
              >
                <Home size={15} />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
