import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price) =>
  `Rs. ${Number(price).toLocaleString('en-PK')}`

export const truncate = (str, n = 50) =>
  str?.length > n ? `${str.substring(0, n)}…` : str

export const getDiscountPercent = (price, salePrice) => {
  if (!salePrice || salePrice >= price) return null
  return Math.round(((price - salePrice) / price) * 100)
}

export const getStockLabel = (stock) => {
  if (stock === 0) return { label: 'Out of Stock', color: 'text-red-500' }
  if (stock <= 5) return { label: 'Low Stock', color: 'text-orange-500' }
  return { label: 'In Stock', color: 'text-green-600' }
}

export const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
