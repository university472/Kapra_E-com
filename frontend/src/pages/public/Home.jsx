import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Star
} from 'lucide-react'
import { categoryAPI, productAPI } from '../../api'
import { useCartStore } from '../../stores/cartStore'
import ProductCard from '../../components/ui/ProductCard'
import { SkeletonGrid } from '../../components/ui/SkeletonCard'
import TrustBadges from '../../components/ui/TrustBadges'
import PageMeta from '../../components/shared/PageMeta'

// ── Hero Slides ──────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: 1,
    headline: 'Eid Collection 2025',
    sub: 'Premium Lawn & Khaddar — Nationwide COD',
    cta: 'Shop Eid Collection',
    ctaLink: '/products?occasion=eid',
    bg: 'from-brand-500/90 to-brand-700/90',
    img: 'https://placehold.co/1200x600/f4dba8/78350f?text=Eid+Collection+2025'
  },
  {
    id: 2,
    headline: 'Winter Khaddar Is Here',
    sub: 'Warm, thick fabrics for cold days',
    cta: 'Explore Khaddar',
    ctaLink: '/category/women-khaddar',
    bg: 'from-dustyteal/90 to-teal-900/90',
    img: 'https://placehold.co/1200x600/4a7c7e/ffffff?text=Winter+Khaddar+Sale'
  },
  {
    id: 3,
    headline: 'Free Delivery Above Rs. 2,999',
    sub: 'Cash on Delivery • Easy 7-Day Returns',
    cta: 'Shop Now',
    ctaLink: '/products',
    bg: 'from-gray-800/90 to-gray-900/90',
    img: 'https://placehold.co/1200x600/1f2937/f9fafb?text=Free+Delivery+Pakistan'
  }
]

// ── Category Cards config ────────────────────────────────
const CATEGORY_HIGHLIGHTS = [
  {
    slug: 'women-lawn',
    label: "Women's Lawn",
    emoji: '🌸',
    // bg: 'bg-pink-50 border-pink-100',
    img: 'https://placehold.co/400x400/fce4ec/9d174d?text=Women%27s+Lawn',
    text: 'text-pink-700'
  },
  {
    slug: 'women-khaddar',
    label: 'Khaddar',
    emoji: '🧣',
    bg: 'bg-amber-50 border-amber-100',
    text: 'text-amber-700'
  },
  {
    slug: 'cotton-unstitched',
    label: 'Cotton',
    emoji: '☁️',
    bg: 'bg-sky-50 border-sky-100',
    text: 'text-sky-700'
  },
  {
    slug: 'men-khaddar',
    label: "Men's Fabric",
    emoji: '👔',
    bg: 'bg-stone-50 border-stone-200',
    text: 'text-stone-700'
  },
  {
    slug: 'chiffon-dupatta',
    label: 'Dupattas',
    emoji: '✨',
    bg: 'bg-purple-50 border-purple-100',
    text: 'text-purple-700'
  }
]

export default function Home() {
  const [slide, setSlide] = useState(0)
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loadingFeat, setLoadingFeat] = useState(true)
  const [loadingNew, setLoadingNew] = useState(true)
  const navigate = useNavigate()

  // ── Auto-advance hero slider ─────────────────────────
  useEffect(() => {
    const timer = setInterval(
      () => setSlide((s) => (s + 1) % HERO_SLIDES.length),
      5000
    )
    return () => clearInterval(timer)
  }, [])

  // ── Fetch data ───────────────────────────────────────
  useEffect(() => {
    categoryAPI
      .getAll()
      .then(({ data }) => setCategories(data))
      .catch(() => {})

    productAPI
      .getAll({ featured: 'true', limit: 8 })
      .then(({ data }) => setFeatured(data.products))
      .catch(() => {})
      .finally(() => setLoadingFeat(false))

    productAPI
      .getAll({ sort: 'createdAt_desc', limit: 8 })
      .then(({ data }) => setNewArrivals(data.products))
      .catch(() => {})
      .finally(() => setLoadingNew(false))
  }, [])

  const currentSlide = HERO_SLIDES[slide]

  return (
    <>
      <PageMeta
        title="Premium Unstitched Fabric — Lawn, Khaddar & More"
        description="Shop premium unstitched fabric online in Pakistan. Lawn, khaddar,
          cotton, chiffon. Nationwide Cash on Delivery. Free shipping above Rs. 2,999."
      />

      {/* ─────────────────────────────────────────────── */}
      {/* HERO SLIDER                                     */}
      {/* ─────────────────────────────────────────────── */}
      <section
        className="relative w-full overflow-hidden bg-gray-900
                           h-[300px] sm:h-[420px] md:h-[500px]"
      >
        {/* Slides */}
        {HERO_SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700
                        ${i === slide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={s.img}
              alt={s.headline}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${s.bg}`} />

            {/* Text */}
            <div
              className="absolute inset-0 flex flex-col
                            justify-center px-6 sm:px-12 md:px-20"
            >
              <div className="max-w-xl">
                <p
                  className="text-white/80 text-sm sm:text-base
                               font-medium mb-2 tracking-wider uppercase"
                >
                  ✨ Kapra Store
                </p>
                <h1
                  className="font-display text-3xl sm:text-4xl
                                md:text-5xl font-bold text-white
                                leading-tight mb-3"
                >
                  {s.headline}
                </h1>
                <p className="text-white/85 text-sm sm:text-base mb-6">
                  {s.sub}
                </p>
                <Link
                  to={s.ctaLink}
                  className="inline-flex items-center gap-2
                             bg-white text-brand-700 font-semibold
                             px-6 py-3 rounded-full text-sm
                             hover:bg-brand-50 transition-colors
                             shadow-lg hover:shadow-xl"
                >
                  {s.cta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Arrows */}
        <button
          onClick={() =>
            setSlide((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
          }
          className="absolute left-3 top-1/2 -translate-y-1/2
                     w-9 h-9 bg-white/20 hover:bg-white/40
                     backdrop-blur-sm rounded-full
                     flex items-center justify-center
                     text-white transition-colors z-10"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => setSlide((s) => (s + 1) % HERO_SLIDES.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2
                     w-9 h-9 bg-white/20 hover:bg-white/40
                     backdrop-blur-sm rounded-full
                     flex items-center justify-center
                     text-white transition-colors z-10"
        >
          <ChevronRight size={18} />
        </button>

        {/* Dots */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2
                        flex gap-2 z-10"
        >
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`rounded-full transition-all duration-300
                          ${
                            i === slide
                              ? 'bg-white w-6 h-2'
                              : 'bg-white/50 w-2 h-2'
                          }`}
            />
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* TRUST BADGES                                    */}
      {/* ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <TrustBadges />
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* SHOP BY CATEGORY                                */}
      {/* ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-display text-2xl sm:text-3xl
                         font-bold text-gray-900"
          >
            Shop by Category
          </h2>
          <Link
            to="/products"
            className="text-sm text-brand-600 font-semibold
                       flex items-center gap-1 hover:gap-2
                       transition-all"
          >
            All Categories
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {CATEGORY_HIGHLIGHTS.map(({ slug, label, emoji, bg, text }) => (
            <Link
              key={slug}
              to={`/category/${slug}`}
              className={`flex flex-col items-center justify-center
                          gap-2 p-4 sm:p-5 rounded-2xl border
                          hover:shadow-md transition-all duration-200
                          hover:-translate-y-0.5 text-center
                          ${bg}`}
            >
              <span className="text-3xl sm:text-4xl">{emoji}</span>
              <span
                className={`text-xs sm:text-sm font-semibold
                                leading-tight ${text}`}
              >
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* FEATURED PRODUCTS                               */}
      {/* ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star className="text-brand-500 fill-brand-400" size={22} />
            <h2
              className="font-display text-2xl sm:text-3xl
                           font-bold text-gray-900"
            >
              Featured Picks
            </h2>
          </div>
          <Link
            to="/products?featured=true"
            className="text-sm text-brand-600 font-semibold
                       flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All
            <ArrowRight size={15} />
          </Link>
        </div>

        {loadingFeat ? (
          <SkeletonGrid count={8} />
        ) : featured.length === 0 ? (
          <EmptyState message="No featured products yet" />
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3
                          lg:grid-cols-4 gap-4"
          >
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* PROMO BANNER                                    */}
      {/* ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
        <div
          className="bg-gradient-to-r from-brand-500 to-brand-700
                        rounded-3xl p-8 sm:p-12 text-white
                        flex flex-col sm:flex-row items-center
                        justify-between gap-6 text-center sm:text-left"
        >
          <div>
            <p className="text-brand-200 text-sm font-medium mb-2 uppercase tracking-wider">
              Limited Time Offer
            </p>
            <h3
              className="font-display text-2xl sm:text-3xl
                           font-bold mb-2"
            >
              Get Free Shipping!
            </h3>
            <p className="text-brand-100 text-sm sm:text-base">
              Order above Rs. 2,999 and enjoy free nationwide delivery
            </p>
          </div>
          <Link
            to="/products"
            className="shrink-0 bg-white text-brand-700 font-bold
                       px-8 py-3 rounded-full hover:bg-brand-50
                       transition-colors text-sm shadow-lg"
          >
            Shop Now →
          </Link>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* NEW ARRIVALS                                    */}
      {/* ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-brand-500" size={22} />
            <h2
              className="font-display text-2xl sm:text-3xl
                           font-bold text-gray-900"
            >
              New Arrivals
            </h2>
          </div>
          <Link
            to="/products?sort=createdAt_desc"
            className="text-sm text-brand-600 font-semibold
                       flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All
            <ArrowRight size={15} />
          </Link>
        </div>

        {loadingNew ? (
          <SkeletonGrid count={8} />
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3
                          lg:grid-cols-4 gap-4"
          >
            {newArrivals.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* WHY CHOOSE US                                   */}
      {/* ─────────────────────────────────────────────── */}
      <section className="bg-white mt-16 py-14 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2
            className="font-display text-2xl sm:text-3xl font-bold
                         text-gray-900 text-center mb-10"
          >
            Why Shop With Us?
          </h2>
          <div
            className="grid grid-cols-2 sm:grid-cols-3
                          md:grid-cols-6 gap-6 text-center"
          >
            {[
              { emoji: '🇵🇰', label: 'Made in Pakistan' },
              { emoji: '💯', label: 'Premium Quality' },
              { emoji: '💸', label: 'COD Available' },
              { emoji: '🚚', label: 'Fast Delivery' },
              { emoji: '🔄', label: 'Easy Returns' },
              { emoji: '💬', label: 'WhatsApp Support' }
            ].map(({ emoji, label }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <span className="text-4xl">{emoji}</span>
                <span className="text-sm font-semibold text-gray-700">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom spacing for mobile nav */}
      <div className="h-20 sm:h-8" />
    </>
  )
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-5xl mb-3">🧵</p>
      <p className="font-medium">{message}</p>
    </div>
  )
}
