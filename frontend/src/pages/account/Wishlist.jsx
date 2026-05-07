export const Wishlist = () => {
  return <div>Wishlist</div>
}
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import { useWishlistStore } from '../../stores/wishlistStore'
import ProductCard from '../../components/ui/ProductCard'
import { SkeletonGrid } from '../../components/ui/SkeletonCard'
import PageMeta from '../../components/shared/PageMeta'

export default function Wishlist() {
  const { products, isLoading, fetchWishlist } = useWishlistStore()

  useEffect(() => {
    fetchWishlist()
  }, [])

  return (
    <>
      <PageMeta title="My Wishlist" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="text-red-500 fill-red-100" size={24} />
          <h1 className="font-display text-2xl font-bold text-gray-900">
            My Wishlist
          </h1>
          {products.length > 0 && (
            <span
              className="bg-red-100 text-red-600 text-sm
                             font-bold px-2.5 py-0.5 rounded-full"
            >
              {products.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <SkeletonGrid count={8} />
        ) : products.length === 0 ? (
          <div
            className="text-center py-24 bg-white rounded-3xl
                          border border-gray-100"
          >
            <Heart size={56} className="mx-auto text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Save fabrics you love by tapping the heart icon
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2
                         bg-brand-500 text-white font-bold
                         px-8 py-3 rounded-full hover:bg-brand-600
                         transition-colors"
            >
              <ShoppingBag size={18} />
              Browse Fabrics
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
      <div className="h-20 sm:h-0" />
    </>
  )
}
