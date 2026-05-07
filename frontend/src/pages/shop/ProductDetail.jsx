import { useState, useEffect } from 'react'
import ReviewSection from '../../components/ui/ReviewSection'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useRecentlyViewedStore } from '../../stores/recentlyViewedStore'
import {
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Truck,
  RefreshCcw,
  Banknote,
  Shield,
  Minus,
  Plus,
  Check
} from 'lucide-react'
import { productAPI } from '../../api'
import { useCartStore } from '../../stores/cartStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import { useAuthStore } from '../../stores/authStore'
import ProductCard from '../../components/ui/ProductCard'
import { SkeletonGrid } from '../../components/ui/SkeletonCard'
import TrustBadges from '../../components/ui/TrustBadges'
import PageMeta from '../../components/shared/PageMeta'
import { formatPrice, getDiscountPercent, getStockLabel } from '../../lib/utils'
import { toast } from 'sonner'

// ── ADDED: Social Proof components ───────────────────────
import {
  ViewersCount,
  SoldCount,
  StockUrgency
} from '../../components/ui/SocialProof'

// ── ADDED: RestockAlert component ────────────────────────
import RestockAlert from '../../components/ui/RestockAlert'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, isLoading: cartLoading } = useCartStore()
  const { toggle, isWishlisted } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  // Recently viewed store hook
  const { add: addToRecentlyViewed } = useRecentlyViewedStore()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [zoomed, setZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 })
  const [addedAnim, setAddedAnim] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setActiveImg(0)
    setQty(1)

    productAPI
      .getById(id)
      .then(({ data }) => {
        setProduct(data)
        // Fetch related products (same fabricType)
        return productAPI.getAll({
          fabricType: data.fabricType,
          limit: 4
        })
      })
      .then(({ data }) => {
        setRelated(data.products.filter((p) => p._id !== id))
      })
      .catch(() => navigate('/products'))
      .finally(() => setIsLoading(false))
  }, [id])

  // Track product in recently viewed when loaded
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product)
    }
  }, [product, addToRecentlyViewed])

  if (isLoading) return <ProductDetailSkeleton />
  if (!product) return null

  const {
    name,
    images = [],
    price,
    salePrice,
    fabricType,
    gsm,
    yardage,
    washCare,
    description,
    stock,
    colors = [],
    occasion,
    category,
    tags = []
  } = product

  const discount = getDiscountPercent(price, salePrice)
  const stockInfo = getStockLabel(stock)
  const wishlisted = isWishlisted(product._id)

  const handleAddToCart = async () => {
    if (stock === 0) return
    await addItem(product._id, qty)
    setAddedAnim(true)
    setTimeout(() => setAddedAnim(false), 2000)
  }

  const handleBuyNow = async () => {
    if (stock === 0) return
    await addItem(product._id, qty)
    navigate('/checkout')
  }

  const handleWishlist = () => {
    if (!isAuthenticated()) {
      toast.error('Please login to save to wishlist')
      navigate('/login')
      return
    }
    toggle(product._id)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: name,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  // Image zoom on mousemove (desktop)
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  return (
    <>
      <PageMeta
        title={name}
        description={
          description || `Buy ${name} online — ${fabricType} fabric with COD.`
        }
        image={images[0]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-brand-500">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-brand-500">
            Fabrics
          </Link>
          {category && (
            <>
              <span>/</span>
              <Link
                to={`/category/${category.slug}`}
                className="hover:text-brand-500"
              >
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-600 font-medium line-clamp-1">{name}</span>
        </nav>

        {/* ── Main Section ──────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* ── Image Gallery ──────────────────────── */}
          <div className="lg:w-[55%] lg:sticky lg:top-24 lg:self-start">
            {/* Main Image */}
            <div
              className="relative overflow-hidden rounded-2xl bg-gray-50
                         aspect-[3/4] cursor-zoom-in border border-gray-100
                         shadow-sm"
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={images[activeImg] || '/placeholder.png'}
                alt={name}
                className={`w-full h-full object-cover transition-transform
                            duration-200
                            ${zoomed ? 'scale-150' : 'scale-100'}`}
                style={
                  zoomed
                    ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                    : {}
                }
                draggable={false}
              />

              {/* Zoom hint */}
              {!zoomed && images.length > 0 && (
                <div
                  className="absolute bottom-3 right-3
                                bg-black/40 text-white text-xs
                                px-2 py-1 rounded-lg flex items-center gap-1
                                backdrop-blur-sm"
                >
                  <ZoomIn size={12} />
                  Hover to zoom
                </div>
              )}

              {/* Discount badge */}
              {discount && (
                <div
                  className="absolute top-3 left-3 bg-red-500 text-white
                                text-sm font-bold px-3 py-1 rounded-full"
                >
                  -{discount}% OFF
                </div>
              )}

              {/* Prev/Next arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImg(
                        (i) => (i - 1 + images.length) % images.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2
                               w-9 h-9 bg-white/80 hover:bg-white
                               rounded-full flex items-center justify-center
                               shadow-md transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               w-9 h-9 bg-white/80 hover:bg-white
                               rounded-full flex items-center justify-center
                               shadow-md transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2.5 mt-3 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-16 h-20 sm:w-20 sm:h-24
                                rounded-xl overflow-hidden border-2
                                transition-all
                                ${
                                  i === activeImg
                                    ? 'border-brand-500 shadow-md'
                                    : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                  >
                    <img
                      src={img}
                      alt={`${name} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ───────────────────────── */}
          <div className="lg:w-[45%] flex flex-col gap-5">
            {/* Title + Actions */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  {category && (
                    <Link
                      to={`/category/${category.slug}`}
                      className="text-xs font-semibold text-brand-600
                                 bg-brand-50 px-2.5 py-1 rounded-full
                                 hover:bg-brand-100 transition-colors capitalize"
                    >
                      {category.name}
                    </Link>
                  )}
                  <h1
                    className="font-display text-xl sm:text-2xl
                                 lg:text-3xl font-bold text-gray-900
                                 mt-2 leading-tight"
                  >
                    {name}
                  </h1>
                </div>
                <div className="flex gap-2 shrink-0 mt-1">
                  <button
                    onClick={handleWishlist}
                    className="w-9 h-9 rounded-full border border-gray-200
                               flex items-center justify-center
                               hover:border-red-300 hover:bg-red-50
                               transition-colors"
                  >
                    <Heart
                      size={17}
                      className={
                        wishlisted
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-400'
                      }
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-9 h-9 rounded-full border border-gray-200
                               flex items-center justify-center
                               hover:border-brand-300 hover:bg-brand-50
                               transition-colors"
                  >
                    <Share2 size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-brand-600">
                {formatPrice(salePrice || price)}
              </span>
              {salePrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(price)}
                  </span>
                  <span
                    className="bg-red-50 text-red-600 text-sm
                                   font-bold px-2.5 py-0.5 rounded-full"
                  >
                    Save {formatPrice(price - salePrice)}
                  </span>
                </>
              )}
            </div>

            {/* Stock status */}
            <div
              className={`flex items-center gap-2 text-sm font-semibold
                             ${stockInfo.color}`}
            >
              <div
                className={`w-2 h-2 rounded-full
                               ${
                                 stock > 0
                                   ? 'bg-green-500 animate-pulse'
                                   : 'bg-red-500'
                               }`}
              />
              {stockInfo.label}
              {stock > 0 && stock <= 10 && (
                <span className="text-orange-500 font-normal">
                  — Only {stock} left
                </span>
              )}
            </div>

            {/* ── Fabric Specs Table ──────────────── */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <h3
                className="text-sm font-bold text-gray-800 mb-3
                             flex items-center gap-2"
              >
                🧵 Fabric Specifications
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: 'Fabric Type',
                    value: fabricType,
                    cls: 'capitalize'
                  },
                  {
                    label: 'Yardage',
                    value: yardage ? `${yardage} Meters` : '—'
                  },
                  { label: 'GSM Weight', value: gsm ? `${gsm} GSM` : '—' },
                  {
                    label: 'Occasion',
                    value: occasion || '—',
                    cls: 'capitalize'
                  },
                  {
                    label: 'Wash Care',
                    value: washCare || 'Dry Clean / Hand Wash'
                  },
                  {
                    label: 'Colors',
                    value: colors.length ? colors.join(', ') : 'See image'
                  }
                ]
                  .filter((r) => r.value && r.value !== '—')
                  .map(({ label, value, cls = '' }) => (
                    <div
                      key={label}
                      className="bg-white rounded-xl p-3 border border-gray-100"
                    >
                      <p
                        className="text-[10px] text-gray-400 font-medium uppercase
                                    tracking-wider mb-0.5"
                      >
                        {label}
                      </p>
                      <p
                        className={`text-sm font-semibold text-gray-800 ${cls}`}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Color swatches */}
            {colors.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Available Colors
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <span
                      key={c}
                      className="text-xs bg-white border border-gray-200
                                 text-gray-700 px-3 py-1.5 rounded-full
                                 capitalize font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity selector */}
            {stock > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Quantity
                </p>
                <div
                  className="flex items-center gap-0 w-fit
                                border border-gray-200 rounded-xl
                                overflow-hidden bg-white"
                >
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="px-4 py-2.5 text-gray-600
                               hover:bg-gray-50 disabled:opacity-40
                               transition-colors border-r border-gray-200"
                  >
                    <Minus size={15} />
                  </button>
                  <span
                    className="px-5 py-2.5 font-bold text-gray-800
                                   min-w-[3rem] text-center"
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(stock, q + 1))}
                    disabled={qty >= stock}
                    className="px-4 py-2.5 text-gray-600
                               hover:bg-gray-50 disabled:opacity-40
                               transition-colors border-l border-gray-200"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ── ADDED: Social Proof Components (before CTA) ── */}
            <div className="space-y-2">
              <ViewersCount productId={product._id} />
              <StockUrgency stock={stock} />
            </div>

            {/* ── CTA Buttons (modified: RestockAlert when out of stock) ── */}
            <div className="flex gap-3">
              {stock === 0 ? (
                <RestockAlert productId={product._id} />
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={cartLoading}
                    className={`flex-1 flex items-center justify-center gap-2
                                py-3.5 rounded-xl font-semibold text-sm
                                transition-all active:scale-95 disabled:opacity-50
                                ${
                                  addedAnim
                                    ? 'bg-green-500 text-white'
                                    : 'bg-brand-500 text-white hover:bg-brand-600'
                                }`}
                  >
                    {addedAnim ? (
                      <>
                        <Check size={17} /> Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={17} />
                        Add to Cart
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex-1 py-3.5 rounded-xl font-semibold text-sm
                               border-2 border-brand-500 text-brand-600
                               hover:bg-brand-50 transition-colors"
                  >
                    Buy Now
                  </button>
                </>
              )}
            </div>

            {/* Mini trust strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
              {[
                {
                  icon: Banknote,
                  text: 'COD Available',
                  color: 'text-green-600'
                },
                {
                  icon: Truck,
                  text: '3-7 Day Delivery',
                  color: 'text-blue-600'
                },
                {
                  icon: RefreshCcw,
                  text: '7-Day Returns',
                  color: 'text-amber-600'
                },
                { icon: Shield, text: 'Secure Order', color: 'text-purple-600' }
              ].map(({ icon: Icon, text, color }) => (
                <div
                  key={text}
                  className="flex items-center gap-1.5 bg-gray-50
                                rounded-xl p-2.5 border border-gray-100"
                >
                  <Icon size={14} className={color} />
                  <span className="text-[10px] font-medium text-gray-600 leading-tight">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* Description */}
            {description && (
              <div className="pt-2">
                <h3 className="text-sm font-bold text-gray-800 mb-2">
                  Product Description
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-500
                                   px-2.5 py-1 rounded-full capitalize"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Sticky Mobile CTA (modified) ─────────────────────── */}
        <div
          className="fixed bottom-16 left-0 right-0 px-4 z-40
                        sm:hidden bg-white/95 backdrop-blur-sm
                        border-t border-gray-100 py-3 shadow-xl"
        >
          <div className="flex gap-3">
            {stock === 0 ? (
              <RestockAlert productId={product._id} />
            ) : (
              <>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2
                              py-3 rounded-xl font-semibold text-sm
                              transition-colors
                              ${
                                addedAnim
                                  ? 'bg-green-500 text-white'
                                  : 'bg-brand-500 text-white'
                              }`}
                >
                  <ShoppingCart size={16} />
                  {addedAnim ? 'Added! ✓' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm
                             border-2 border-brand-500 text-brand-600"
                >
                  Buy Now
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Related Products ──────────────────────── */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Trust badges */}
        <div className="mt-14">
          <TrustBadges />
        </div>

        {/* ⭐ Reviews Section */}
        <div className="mt-14">
          <ReviewSection
            productId={product._id}
            avgRating={product.avgRating}
            reviewCount={product.reviewCount}
            ratingDist={product.ratingDist}
          />
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="h-36 sm:h-0" />
    </>
  )
}

// ── Skeleton loader for product detail ──────────────────
function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="lg:w-[55%]">
          <div className="aspect-[3/4] shimmer rounded-2xl" />
          <div className="flex gap-2 mt-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-20 h-24 shimmer rounded-xl" />
            ))}
          </div>
        </div>
        <div className="lg:w-[45%] flex flex-col gap-4">
          <div className="h-6 shimmer rounded-lg w-1/3" />
          <div className="h-8 shimmer rounded-lg w-4/5" />
          <div className="h-10 shimmer rounded-lg w-1/2" />
          <div className="h-40 shimmer rounded-2xl" />
          <div className="h-14 shimmer rounded-xl" />
        </div>
      </div>
    </div>
  )
}
