import { useState } from 'react' // ← ADDED for Quick View modal
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Eye } from 'lucide-react' // ← ADDED Eye icon
import { useCartStore } from '../../stores/cartStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import { useAuthStore } from '../../stores/authStore'
import { formatPrice, getDiscountPercent } from '../../lib/utils'
import { toast } from 'sonner'
import QuickViewModal from './QuickViewModal' // ← ADDED import

export default function ProductCard({ product }) {
  const { addItem, isInCart, isLoading } = useCartStore()
  const { toggle, isWishlisted } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  // ── ADDED: Quick View state ──────────────────────────
  const [quickViewId, setQuickViewId] = useState(null)

  const {
    _id,
    name,
    images,
    price,
    salePrice,
    fabricType,
    yardage,
    gsm,
    stock
  } = product

  const discount = getDiscountPercent(price, salePrice)
  const wishlisted = isWishlisted(_id)
  const inCart = isInCart(_id)
  const displayPrice = salePrice || price

  const handleWishlist = (e) => {
    e.preventDefault()
    if (!isAuthenticated()) {
      toast.error('Please login to save to wishlist')
      navigate('/login')
      return
    }
    toggle(_id)
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (stock === 0) return
    addItem(_id, 1)
  }

  return (
    <>
      <Link
        to={`/products/${_id}`}
        className="group bg-white rounded-2xl overflow-hidden
                   shadow-sm border border-gray-100
                   hover:shadow-md transition-all duration-200
                   flex flex-col"
      >
        {/* ── Image ──────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]">
          <img
            src={images?.[0] || '/placeholder.png'}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover
                       group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount && (
              <span
                className="bg-red-500 text-white text-[10px]
                               font-bold px-2 py-0.5 rounded-full"
              >
                -{discount}%
              </span>
            )}
            {stock === 0 && (
              <span
                className="bg-gray-800 text-white text-[10px]
                               font-medium px-2 py-0.5 rounded-full"
              >
                Sold Out
              </span>
            )}
          </div>

          {/* Fabric type badge */}
          <div className="absolute top-2 right-2">
            <span
              className="bg-white/90 backdrop-blur-sm text-brand-600
                             text-[10px] font-semibold px-2 py-0.5
                             rounded-full capitalize border border-brand-100"
            >
              {fabricType}
            </span>
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute bottom-2 right-2 w-8 h-8 bg-white/90
                       backdrop-blur-sm rounded-full flex items-center
                       justify-center shadow-sm border border-gray-100
                       opacity-0 group-hover:opacity-100
                       transition-all duration-200 hover:scale-110"
            aria-label="Toggle wishlist"
          >
            <Heart
              size={15}
              className={
                wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'
              }
            />
          </button>

          {/* ── ADDED: Quick View button ─────────────────── */}
          <button
            onClick={(e) => {
              e.preventDefault()
              setQuickViewId(_id)
            }}
            className="absolute bottom-2 left-2 flex items-center gap-1
                       bg-white/90 backdrop-blur-sm text-gray-700
                       text-[10px] font-semibold px-2.5 py-1.5 rounded-full
                       shadow-sm border border-gray-100
                       opacity-0 group-hover:opacity-100
                       transition-all duration-200 hover:bg-brand-500
                       hover:text-white hover:border-brand-500"
          >
            <Eye size={11} />
            Quick View
          </button>
        </div>

        {/* ── Info ───────────────────────────────────────── */}
        <div className="p-3 flex flex-col gap-2 flex-1">
          <h3
            className="text-sm font-medium text-gray-800 line-clamp-2
                         leading-snug group-hover:text-brand-600
                         transition-colors"
          >
            {name}
          </h3>

          {/* Metadata */}
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
            {yardage && <span>{yardage}m</span>}
            {yardage && gsm && <span>·</span>}
            {gsm && <span>{gsm} GSM</span>}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-base font-bold text-brand-600">
              {formatPrice(displayPrice)}
            </span>
            {salePrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(price)}
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={stock === 0 || isLoading}
            className={`
              flex items-center justify-center gap-1.5
              w-full py-2 rounded-xl text-xs font-semibold
              transition-all duration-200 mt-1
              ${
                stock === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : inCart
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-brand-500 text-white hover:bg-brand-600 active:scale-95'
              }
            `}
          >
            <ShoppingCart size={13} />
            {stock === 0
              ? 'Out of Stock'
              : inCart
                ? 'In Cart ✓'
                : 'Add to Cart'}
          </button>
        </div>
      </Link>

      {/* ── ADDED: Quick View Modal ──────────────────────── */}
      {quickViewId && (
        <QuickViewModal
          productId={quickViewId}
          onClose={() => setQuickViewId(null)}
        />
      )}
    </>
  )
}
