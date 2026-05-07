import { useState, useEffect, useCallback } from 'react'
import { productAPI } from '../api'

export function useProducts(params = {}) {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const key = JSON.stringify(params)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data } = await productAPI.getAll(params)
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }, [key])

  // ✅ FIXED
  useEffect(() => {
    let ignore = false

    const load = async () => {
      if (ignore) return
      await fetchProducts()
    }

    load()

    return () => {
      ignore = true
    }
  }, [fetchProducts])

  return {
    products,
    pagination,
    isLoading,
    error,
    refetch: fetchProducts
  }
}