import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  Truck,
  ShoppingBag
} from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import TrustBadges from '../../components/ui/TrustBadges'
import PageMeta from '../../components/shared/PageMeta'
import { formatPrice, getDiscountPercent } from '../../lib/utils'
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_FEE } from '../../constants'

export default function Cart() {
  const navigate = useNavigate()
  const {
    items,
    subtotal,
    shippingFee,
    total,
    itemCount,
    isLoading,
    fetchCart,
    updateItem,
    removeItem,
    clearCart
  } = useCartStore()

  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    fetchCart()
  }, [])

  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal

  return (
    <>
      <PageMeta title="My Cart" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="text-brand-500" size={24} />
          <h1
            className="font-display text-2xl sm:text-3xl
                         font-bold text-gray-900"
          >
            My Cart
          </h1>
          {itemCount > 0 && (
            <span
              className="bg-brand-100 text-brand-700 text-sm
                             font-bold px-2.5 py-0.5 rounded-full"
            >
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Empty Cart */}
        {!isLoading && items.length === 0 && (
          <div className="text-center py-24">
            <ShoppingBag size={64} className="mx-auto text-gray-200 mb-5" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Discover our premium fabrics and add something beautiful!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2
                         bg-brand-500 text-white font-semibold
                         px-8 py-3 rounded-full hover:bg-brand-600
                         transition-colors"
            >
              <ShoppingCart size={18} />
              Start Shopping
            </Link>
          </div>
        )}

        {/* Cart Content */}
        {items.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* ── Cart Items ──────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Free shipping progress */}
              {amountToFreeShipping > 0 && (
                <div
                  className="bg-amber-50 border border-amber-200
                                rounded-2xl p-4 mb-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Truck size={16} className="text-amber-600" />
                    <p className="text-sm font-semibold text-amber-800">
                      Add{' '}
                      <span className="text-brand-600">
                        {formatPrice(amountToFreeShipping)}
                      </span>{' '}
                      more for <strong>FREE delivery!</strong>
                    </p>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full
                                 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
                          100
                        )}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {amountToFreeShipping <= 0 && (
                <div
                  className="bg-green-50 border border-green-200
                                rounded-2xl p-4 mb-4 flex items-center gap-2"
                >
                  <Truck size={16} className="text-green-600" />
                  <p className="text-sm font-semibold text-green-800">
                    🎉 You qualify for <strong>FREE delivery!</strong>
                  </p>
                </div>
              )}

              {/* Items list */}
              <div className="space-y-3">
                {items.map((item) => {
                  const product = item.product
                  if (!product) return null

                  const displayPrice = product.salePrice ?? product.price
                  const discount = getDiscountPercent(
                    product.price,
                    product.salePrice
                  )
                  const lineTotal = displayPrice * item.qty

                  return (
                    <div
                      key={item._id || product._id}
                      className="flex gap-4 bg-white rounded-2xl
                                 border border-gray-100 p-4
                                 hover:shadow-sm transition-shadow"
                    >
                      {/* Product Image */}
                      <Link
                        to={`/products/${product._id}`}
                        className="shrink-0"
                      >
                        <img
                          src={product.images?.[0] || '/placeholder.png'}
                          alt={product.name}
                          className="w-20 h-24 sm:w-24 sm:h-28
                                     object-cover rounded-xl border
                                     border-gray-100 bg-gray-50"
                        />
                      </Link>

                      {/* Info */}
                      <div
                        className="flex-1 min-w-0 flex flex-col
                                      justify-between gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span
                              className="text-[10px] font-semibold
                                             text-brand-600 capitalize bg-brand-50
                                             px-2 py-0.5 rounded-full"
                            >
                              {product.fabricType}
                            </span>
                            <Link
                              to={`/products/${product._id}`}
                              className="block text-sm font-semibold
                                         text-gray-800 mt-1 line-clamp-2
                                         hover:text-brand-600 transition-colors"
                            >
                              {product.name}
                            </Link>
                            {product.yardage && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {product.yardage}m
                                {product.gsm ? ` · ${product.gsm} GSM` : ''}
                              </p>
                            )}
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => removeItem(product._id)}
                            className="shrink-0 p-1.5 text-gray-400
                                       hover:text-red-500 hover:bg-red-50
                                       rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div
                          className="flex items-center
                                        justify-between gap-3"
                        >
                          {/* Qty controls */}
                          <div
                            className="flex items-center border
                                          border-gray-200 rounded-xl
                                          overflow-hidden"
                          >
                            <button
                              onClick={() =>
                                updateItem(product._id, item.qty - 1)
                              }
                              disabled={item.qty <= 1}
                              className="px-3 py-1.5 text-gray-500
                                         hover:bg-gray-50 disabled:opacity-40
                                         transition-colors text-lg
                                         leading-none"
                            >
                              <Minus size={13} />
                            </button>
                            <span
                              className="px-3 py-1.5 font-bold
                                             text-sm text-gray-800
                                             min-w-[2rem] text-center"
                            >
                              {item.qty}
                            </span>
                            <button
                              onClick={() =>
                                updateItem(product._id, item.qty + 1)
                              }
                              disabled={item.qty >= product.stock}
                              className="px-3 py-1.5 text-gray-500
                                         hover:bg-gray-50 disabled:opacity-40
                                         transition-colors"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          {/* Line total */}
                          <div className="text-right">
                            <p className="font-bold text-brand-600 text-base">
                              {formatPrice(lineTotal)}
                            </p>
                            {item.qty > 1 && (
                              <p className="text-[10px] text-gray-400">
                                {formatPrice(displayPrice)} each
                              </p>
                            )}
                            {discount && (
                              <p className="text-[10px] text-red-500 font-medium">
                                -{discount}% off
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Clear cart */}
              <div className="flex justify-end mt-3">
                <button
                  onClick={clearCart}
                  className="text-xs text-red-400 hover:text-red-600
                             font-medium flex items-center gap-1.5
                             transition-colors"
                >
                  <Trash2 size={12} />
                  Clear Cart
                </button>
              </div>
            </div>

            {/* ── Order Summary ───────────────────── */}
            <div className="lg:w-80 shrink-0">
              <div
                className="bg-white rounded-2xl border border-gray-100
                              shadow-sm p-6 sticky top-24"
              >
                <h2
                  className="font-display font-bold text-lg
                               text-gray-900 mb-5 flex items-center gap-2"
                >
                  <Tag size={18} className="text-brand-500" />
                  Order Summary
                </h2>

                {/* Line items */}
                <div className="space-y-3 text-sm">
                  {items.map((item) => {
                    const product = item.product
                    if (!product) return null
                    return (
                      <div
                        key={product._id}
                        className="flex justify-between gap-2
                                      text-gray-600"
                      >
                        <span className="line-clamp-1 flex-1">
                          {product.name}
                          <span className="text-gray-400 ml-1">
                            ×{item.qty}
                          </span>
                        </span>
                        <span className="font-medium shrink-0">
                          {formatPrice(
                            (product.salePrice ?? product.price) * item.qty
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-gray-100 my-4" />

                {/* Totals */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">
                      <Truck size={13} />
                      Shipping
                    </span>
                    <span
                      className={`font-medium
                                      ${
                                        shippingFee === 0
                                          ? 'text-green-600'
                                          : ''
                                      }`}
                    >
                      {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-4" />

                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-gray-900 text-base">
                    Total
                  </span>
                  <span
                    className="font-display font-bold
                                   text-2xl text-brand-600"
                  >
                    {formatPrice(total)}
                  </span>
                </div>

                {/* COD badge */}
                <div
                  className="mt-4 bg-green-50 border border-green-200
                                rounded-xl p-3 flex items-center gap-2"
                >
                  <span className="text-xl">💵</span>
                  <div>
                    <p className="text-xs font-bold text-green-800">
                      Cash on Delivery
                    </p>
                    <p className="text-[10px] text-green-600">
                      Pay when you receive your order
                    </p>
                  </div>
                </div>

                {/* Checkout button */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full mt-5 flex items-center justify-center
                             gap-2 bg-brand-500 text-white font-bold
                             py-4 rounded-xl hover:bg-brand-600
                             transition-colors text-base
                             active:scale-95 shadow-md"
                >
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </button>

                {/* Continue shopping */}
                <Link
                  to="/products"
                  className="block text-center text-sm text-brand-600
                             font-semibold mt-3 hover:text-brand-700
                             transition-colors"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Trust badges */}
        <div className="mt-14">
          <TrustBadges />
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="h-20 sm:h-0" />
    </>
  )
}
