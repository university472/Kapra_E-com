import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  SlidersHorizontal,
  Grid2x2,
  List,
  ChevronDown,
  X,
  ArrowUpDown
} from 'lucide-react'
import { productAPI } from '../../api'
import ProductCard from '../../components/ui/ProductCard'
import { SkeletonGrid } from '../../components/ui/SkeletonCard'
import Pagination from '../../components/ui/Pagination'
import FilterSidebar from './FilterSidebar'
import TrustBadges from '../../components/ui/TrustBadges'
import PageMeta from '../../components/shared/PageMeta'
import { SORT_OPTIONS } from '../../constants'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()

  // ── State ────────────────────────────────────────────
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // grid | list

  // Read filters from URL
  const getFiltersFromURL = useCallback(
    () => ({
      page: searchParams.get('page') || '1',
      sort: searchParams.get('sort') || 'createdAt_desc',
      fabricType: searchParams.get('fabricType') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      occasion: searchParams.get('occasion') || undefined,
      yardage: searchParams.get('yardage') || undefined,
      color: searchParams.get('color') || undefined,
      featured: searchParams.get('featured') || undefined,
      limit: '12'
    }),
    [searchParams]
  )

  const filters = getFiltersFromURL()

  // ── Fetch products ───────────────────────────────────
  useEffect(() => {
    setIsLoading(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Strip undefined values before sending
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined)
    )

    productAPI
      .getAll(params)
      .then(({ data }) => {
        setProducts(data.products)
        setPagination(data.pagination)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [searchParams])

  // ── Helpers ──────────────────────────────────────────
  const updateFilter = (newFilters) => {
    const next = new URLSearchParams(searchParams)

    Object.entries(newFilters).forEach(([key, val]) => {
      if (val === undefined || val === '' || val === null) {
        next.delete(key)
      } else {
        next.set(key, val)
      }
    })

    // Reset to page 1 when filters change
    next.set('page', '1')
    setSearchParams(next)
  }

  const resetFilters = () => {
    const next = new URLSearchParams()
    const sort = searchParams.get('sort')
    if (sort) next.set('sort', sort)
    setSearchParams(next)
  }

  const handleSort = (value) => {
    const next = new URLSearchParams(searchParams)
    next.set('sort', value)
    next.set('page', '1')
    setSearchParams(next)
    setSortOpen(false)
  }

  const handlePageChange = (page) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }

  // Active filter count (excluding sort and page)
  const activeFilterCount = [
    'fabricType',
    'occasion',
    'yardage',
    'color',
    'minPrice',
    'maxPrice',
    'featured'
  ].filter((k) => searchParams.get(k)).length

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === filters.sort)?.label || 'Newest First'

  return (
    <>
      <PageMeta
        title="All Fabrics — Lawn, Khaddar, Cotton & More"
        description="Browse premium unstitched fabrics with filters by price, fabric type,
          yardage, and more. COD available."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ── Breadcrumb ─────────────────────────────── */}
        <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
          <Link to="/" className="hover:text-brand-500">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">All Fabrics</span>
        </nav>

        {/* ── Page Header ────────────────────────────── */}
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <h1
              className="font-display text-2xl sm:text-3xl
                           font-bold text-gray-900"
            >
              {filters.featured === 'true'
                ? '✨ Featured Fabrics'
                : 'All Fabrics'}
            </h1>
            {pagination && (
              <p className="text-sm text-gray-500 mt-1">
                {pagination.total.toLocaleString()} products found
              </p>
            )}
          </div>
        </div>

        {/* ── Toolbar (mobile filter + sort) ─────────── */}
        <div className="flex items-center gap-3 mb-6">
          {/* Filter toggle button */}
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5
                       border border-gray-200 rounded-xl text-sm
                       font-medium text-gray-700 hover:border-brand-300
                       hover:text-brand-600 transition-colors
                       bg-white shadow-sm relative"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5
                               bg-brand-500 text-white text-[10px]
                               rounded-full w-4 h-4 flex items-center
                               justify-center font-bold"
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Active filter tags */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 items-center">
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="shrink-0 flex items-center gap-1
                             text-xs text-red-500 font-semibold
                             px-2.5 py-1.5 rounded-full border
                             border-red-100 bg-red-50
                             hover:bg-red-100 transition-colors"
                >
                  <X size={11} />
                  Clear all
                </button>
              )}
              {[
                { key: 'fabricType', label: filters.fabricType },
                { key: 'occasion', label: filters.occasion },
                {
                  key: 'yardage',
                  label: filters.yardage ? `${filters.yardage}m` : null
                },
                {
                  key: 'featured',
                  label: filters.featured === 'true' ? 'Featured' : null
                }
              ]
                .filter((f) => f.label)
                .map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => updateFilter({ [key]: undefined })}
                    className="shrink-0 flex items-center gap-1
                               text-xs bg-brand-50 text-brand-700
                               font-medium px-3 py-1.5 rounded-full
                               border border-brand-100 hover:bg-brand-100
                               transition-colors capitalize"
                  >
                    {label}
                    <X size={11} />
                  </button>
                ))}
            </div>
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-4 py-2.5
                         border border-gray-200 rounded-xl text-sm
                         font-medium text-gray-700 hover:border-brand-300
                         hover:text-brand-600 transition-colors
                         bg-white shadow-sm whitespace-nowrap"
            >
              <ArrowUpDown size={15} />
              <span className="hidden sm:block">{currentSortLabel}</span>
              <span className="sm:hidden">Sort</span>
              <ChevronDown size={14} />
            </button>

            {sortOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setSortOpen(false)}
                />
                <div
                  className="absolute right-0 top-full mt-1
                                bg-white border border-gray-200
                                rounded-xl shadow-lg z-40
                                overflow-hidden min-w-[180px]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSort(opt.value)}
                      className={`w-full text-left px-4 py-2.5 text-sm
                                  transition-colors
                                  ${
                                    filters.sort === opt.value
                                      ? 'bg-brand-50 text-brand-700 font-semibold'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Grid / List toggle (desktop) */}
          <div
            className="hidden sm:flex border border-gray-200
                          rounded-xl overflow-hidden shadow-sm"
          >
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors
                          ${
                            viewMode === 'grid'
                              ? 'bg-brand-500 text-white'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
            >
              <Grid2x2 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors
                          ${
                            viewMode === 'list'
                              ? 'bg-brand-500 text-white'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* ── Main Content ───────────────────────────── */}
        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onChange={updateFilter}
            onReset={resetFilters}
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
          />

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <SkeletonGrid count={12} />
            ) : products.length === 0 ? (
              <EmptyProducts onReset={resetFilters} />
            ) : (
              <>
                <div
                  className={
                    viewMode === 'list'
                      ? 'flex flex-col gap-4'
                      : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4'
                  }
                >
                  {products.map((p) =>
                    viewMode === 'list' ? (
                      <ProductListItem key={p._id} product={p} />
                    ) : (
                      <ProductCard key={p._id} product={p} />
                    )
                  )}
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
        </div>

        {/* Trust Badges */}
        <div className="mt-14">
          <TrustBadges />
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="h-20 sm:h-0" />
    </>
  )
}

// ── List view card ───────────────────────────────────────
function ProductListItem({ product }) {
  const { addItem, isInCart } = useCartStore()
  const { formatPrice } = { formatPrice: (p) => `Rs. ${p?.toLocaleString()}` }
  const {
    _id,
    name,
    images,
    price,
    salePrice,
    fabricType,
    yardage,
    stock,
    description
  } = product

  return (
    <Link
      to={`/products/${_id}`}
      className="flex gap-4 bg-white rounded-2xl border border-gray-100
                 p-4 hover:shadow-md transition-shadow"
    >
      <img
        src={images?.[0] || '/placeholder.png'}
        alt={name}
        className="w-24 h-28 sm:w-32 sm:h-36 object-cover
                   rounded-xl shrink-0 bg-gray-50"
      />
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <span
            className="text-xs capitalize font-medium text-brand-600
                           bg-brand-50 px-2 py-0.5 rounded-full"
          >
            {fabricType}
          </span>
          <h3
            className="font-semibold text-gray-800 mt-1.5
                         text-sm sm:text-base line-clamp-2"
          >
            {name}
          </h3>
          {description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 hidden sm:block">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between mt-2 gap-3">
          <div>
            <span className="font-bold text-brand-600">
              Rs. {(salePrice || price)?.toLocaleString()}
            </span>
            {salePrice && (
              <span className="text-xs text-gray-400 line-through ml-1.5">
                Rs. {price?.toLocaleString()}
              </span>
            )}
            {yardage && (
              <span className="text-xs text-gray-400 ml-2">• {yardage}m</span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              addItem(_id)
            }}
            disabled={stock === 0}
            className={`text-xs font-semibold px-4 py-2 rounded-xl
                        transition-colors shrink-0
                        ${
                          stock === 0
                            ? 'bg-gray-100 text-gray-400'
                            : isInCart(_id)
                              ? 'bg-green-50 text-green-700'
                              : 'bg-brand-500 text-white hover:bg-brand-600'
                        }`}
          >
            {stock === 0
              ? 'Sold Out'
              : isInCart(_id)
                ? 'In Cart ✓'
                : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}

function EmptyProducts({ onReset }) {
  return (
    <div
      className="text-center py-20 bg-white rounded-2xl
                    border border-gray-100"
    >
      <p className="text-6xl mb-4">🔍</p>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        No Products Found
      </h3>
      <p className="text-gray-500 text-sm mb-5">
        Try adjusting your filters or search query
      </p>
      <button
        onClick={onReset}
        className="bg-brand-500 text-white px-6 py-2.5
                   rounded-full text-sm font-semibold
                   hover:bg-brand-600 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  )
}

// Import useCartStore at top of file too (needed for list item)
import { useCartStore } from '../../stores/cartStore'
