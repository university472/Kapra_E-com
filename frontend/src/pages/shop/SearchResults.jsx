import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { searchAPI } from '../../api'
import ProductCard from '../../components/ui/ProductCard'
import { SkeletonGrid } from '../../components/ui/SkeletonCard'
import Pagination from '../../components/ui/Pagination'
import PageMeta from '../../components/shared/PageMeta'

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''

  const [results, setResults] = useState([])
  const [pagination, setPagination] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const page = Number(searchParams.get('page') || '1')

  useEffect(() => {
    if (!q.trim()) return
    setIsLoading(true)
    searchAPI
      .fullSearch({ q, page, limit: 12 })
      .then(({ data }) => {
        setResults(data.products)
        setPagination(data.pagination)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [q, page])

  const handlePageChange = (p) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <PageMeta title={`Search: "${q}"`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Search size={18} />
            <span className="text-sm">Search results for</span>
          </div>
          <h1
            className="font-display text-2xl sm:text-3xl
                         font-bold text-gray-900"
          >
            "{q}"
          </h1>
          {pagination && (
            <p className="text-sm text-gray-500 mt-1">
              {pagination.total} result{pagination.total !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {isLoading ? (
          <SkeletonGrid count={12} />
        ) : results.length === 0 && q ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">😕</p>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No results for "{q}"
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Try different keywords or browse our categories
            </p>
            <Link
              to="/products"
              className="bg-brand-500 text-white px-6 py-2.5
                         rounded-full text-sm font-semibold
                         hover:bg-brand-600 transition-colors"
            >
              Browse All Fabrics
            </Link>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-2 sm:grid-cols-3
                            lg:grid-cols-4 gap-4"
            >
              {results.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
            {pagination && (
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>

      <div className="h-20 sm:h-0" />
    </>
  )
}
