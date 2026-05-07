import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { categoryAPI } from '../../api'
import Products from './Products'
import PageMeta from '../../components/shared/PageMeta'

// Category is essentially the Products page but pre-filtered by category slug
export default function Category() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [category, setCategory] = useState(null)

  useEffect(() => {
    categoryAPI
      .getBySlug(slug)
      .then(({ data }) => {
        setCategory(data)
        // Inject category ID into search params so Products page filters by it
        const next = new URLSearchParams(searchParams)
        next.set('category', data._id)
        next.set('page', '1')
        setSearchParams(next, { replace: true })
      })
      .catch(() => {})
  }, [slug])

  return (
    <>
      {category && (
        <PageMeta
          title={`${category.name} — Unstitched Fabric`}
          description={`Shop ${category.name} fabric. Premium quality, nationwide COD delivery.`}
          image={category.image}
        />
      )}

      {/* Category Hero Banner */}
      {category && (
        <div
          className="bg-gradient-to-r from-brand-50 to-blush
                        border-b border-brand-100 py-8 px-4 sm:px-6"
        >
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav
              className="text-xs text-gray-400 mb-3
                            flex items-center gap-1.5"
            >
              <Link to="/" className="hover:text-brand-500">
                Home
              </Link>
              <span>/</span>
              <Link to="/products" className="hover:text-brand-500">
                All Fabrics
              </Link>
              <span>/</span>
              <span className="text-gray-600 font-medium">{category.name}</span>
            </nav>

            <h1
              className="font-display text-3xl sm:text-4xl
                           font-bold text-gray-900"
            >
              {category.name}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Premium unstitched {category.name.toLowerCase()} fabric — Cash on
              Delivery available
            </p>
          </div>
        </div>
      )}

      {/* Reuse Products page with category pre-applied */}
      <Products />
    </>
  )
}
