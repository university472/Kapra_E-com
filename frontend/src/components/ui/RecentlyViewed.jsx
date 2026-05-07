import { Link } from 'react-router-dom'
import { Clock, ChevronRight } from 'lucide-react'
import { useRecentlyViewedStore } from '../../stores/recentlyViewedStore'
import { formatPrice } from '../../lib/utils'

export default function RecentlyViewed({ excludeId }) {
  const { items } = useRecentlyViewedStore()
  const filtered = items.filter((p) => p._id !== excludeId).slice(0, 6)

  if (filtered.length === 0) return null

  return (
    <section className="mt-14">
      <div className="flex items-center justify-between mb-5">
        <h2
          className="font-display text-xl font-bold text-gray-900
                       flex items-center gap-2"
        >
          <Clock size={19} className="text-brand-500" />
          Recently Viewed
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {filtered.map((product) => (
          <Link
            key={product._id}
            to={`/products/${product._id}`}
            className="shrink-0 w-36 sm:w-40 bg-white rounded-2xl
                       border border-gray-100 shadow-sm overflow-hidden
                       hover:shadow-md hover:-translate-y-0.5
                       transition-all duration-200 group"
          >
            <div className="aspect-[3/4] bg-gray-50 overflow-hidden">
              <img
                src={product.images?.[0] || '/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-cover
                           group-hover:scale-105 transition-transform
                           duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-2.5">
              <p
                className="text-xs font-medium text-gray-700 line-clamp-2
                             leading-snug"
              >
                {product.name}
              </p>
              <p className="text-sm font-bold text-brand-600 mt-1">
                {formatPrice(product.salePrice || product.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
