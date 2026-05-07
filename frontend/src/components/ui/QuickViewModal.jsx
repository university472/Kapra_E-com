import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  ShoppingCart,
  Heart,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Check,
  Minus,
  Plus
} from 'lucide-react'
import { productAPI } from '../../api'
import { useCartStore } from '../../stores/cartStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import { useAuthStore } from '../../stores/authStore'
import { StarRating } from './StarRating'
import { formatPrice, getDiscountPercent, getStockLabel } from '../../lib/utils'
import { toast } from 'sonner'

export default function QuickViewModal({ productId, onClose }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const { addItem, isLoading: cartLoading } = useCartStore()
  const { toggle, isWishlisted } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    productAPI
      .getById(productId)
      .then(({ data }) => setProduct(data))
      .catch(() => onClose())
      .finally(() => setLoading(false))
    return () => {
      document.body.style.overflow = ''
    }
  }, [productId])

  const handleAddToCart = async () => {
    await addItem(product._id, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleWishlist = () => {
    if (!isAuthenticated()) {
      toast.error('Please login')
      return
    }
    toggle(product._id)
  }

  if (loading || !product) {
    return (
      <ModalBackdrop onClose={onClose}>
        <div
          className="bg-white rounded-3xl p-8 flex items-center
                        justify-center w-full max-w-2xl mx-4"
        >
          <div
            className="w-8 h-8 border-2 border-brand-500/30
                          border-t-brand-500 rounded-full animate-spin"
          />
        </div>
      </ModalBackdrop>
    )
  }

  const {
    name,
    images = [],
    price,
    salePrice,
    fabricType,
    gsm,
    yardage,
    stock,
    description,
    avgRating,
    reviewCount
  } = product

  const discount = getDiscountPercent(price, salePrice)
  const stockInfo = getStockLabel(stock)
  const wishlisted = isWishlisted(product._id)

  return (
    <ModalBackdrop onClose={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl
                   mx-4 overflow-hidden max-h-[90vh] overflow-y-auto
                   relative animate-in slide-in-from-bottom-4
                   duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90
                     backdrop-blur-sm border border-gray-200 rounded-full
                     flex items-center justify-center hover:bg-gray-100
                     transition-colors shadow-sm"
        >
          <X size={17} />
        </button>

        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div
            className="sm:w-48 lg:w-64 shrink-0 bg-gray-50 relative
                          aspect-[3/4] sm:aspect-auto"
          >
            <img
              src={images[activeImg] || '/placeholder.png'}
              alt={name}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImg((i) => (i - 1 + images.length) % images.length)
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2
                             w-7 h-7 bg-white/80 rounded-full flex items-center
                             justify-center shadow-sm"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2
                             w-7 h-7 bg-white/80 rounded-full flex items-center
                             justify-center shadow-sm"
                >
                  <ChevronRight size={14} />
                </button>
              </>
            )}
            {discount && (
              <span
                className="absolute top-3 left-3 bg-red-500 text-white
                               text-xs font-bold px-2 py-0.5 rounded-full"
              >
                -{discount}%
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col gap-3">
            {/* Fabric badge + name */}
            <span
              className="text-xs font-bold text-brand-600 bg-brand-50
                             px-2 py-0.5 rounded-full w-fit capitalize"
            >
              {fabricType}
            </span>
            <h2
              className="font-display text-lg font-bold text-gray-900
                           leading-tight"
            >
              {name}
            </h2>

            {/* Rating */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={avgRating} size={14} />
                <span className="text-xs text-gray-500">
                  ({reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-brand-600">
                {formatPrice(salePrice || price)}
              </span>
              {salePrice && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(price)}
                </span>
              )}
            </div>

            {/* Stock */}
            <p className={`text-xs font-semibold ${stockInfo.color}`}>
              ● {stockInfo.label}
            </p>

            {/* Specs mini-grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Fabric', value: fabricType },
                { label: 'Yardage', value: yardage ? `${yardage}m` : '—' },
                { label: 'GSM', value: gsm ? `${gsm}` : '—' }
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-gray-50 rounded-xl p-2.5 text-center
                                border border-gray-100"
                >
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="text-xs font-bold text-gray-800 capitalize mt-0.5">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Description excerpt */}
            {description && (
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}

            {/* Qty + Add to Cart */}
            {stock > 0 && (
              <div className="flex items-center gap-2 mt-auto">
                <div
                  className="flex items-center border border-gray-200
                                rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-gray-50 text-gray-600
                               disabled:opacity-40"
                    disabled={qty <= 1}
                  >
                    <Minus size={13} />
                  </button>
                  <span className="px-4 py-2 font-bold text-sm text-gray-800">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(stock, q + 1))}
                    className="px-3 py-2 hover:bg-gray-50 text-gray-600
                               disabled:opacity-40"
                    disabled={qty >= stock}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className={`flex-1 flex items-center justify-center gap-2
                              py-2.5 rounded-xl font-bold text-sm
                              transition-all active:scale-95
                              ${
                                added
                                  ? 'bg-green-500 text-white'
                                  : 'bg-brand-500 text-white hover:bg-brand-600'
                              }`}
                >
                  {added ? (
                    <>
                      <Check size={15} /> Added!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={15} /> Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleWishlist}
                  className={`p-2.5 rounded-xl border-2 transition-colors
                              ${
                                wishlisted
                                  ? 'border-red-300 bg-red-50'
                                  : 'border-gray-200 hover:border-red-200'
                              }`}
                >
                  <Heart
                    size={16}
                    className={
                      wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'
                    }
                  />
                </button>
              </div>
            )}

            {/* Full page link */}
            <Link
              to={`/products/${product._id}`}
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs text-brand-600
                         font-semibold hover:underline mt-1"
            >
              <ExternalLink size={12} />
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  )
}

function ModalBackdrop({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50
                 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {children}
    </div>
  )
}
