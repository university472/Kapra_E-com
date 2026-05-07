import Wishlist from '../models/Wishlist.js'
import Product from '../models/Product.js'
import asyncHandler from '../utils/asyncHandler.js'

// ── GET /api/wishlist ────────────────────────────────────
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
    path: 'products',
    select: 'name slug images price salePrice fabricType stock isActive',
    match: { isActive: true }
  })

  res.json({
    products: wishlist?.products ?? [],
    count: wishlist?.products?.length ?? 0
  })
})

// ── POST /api/wishlist/toggle/:productId ─────────────────
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params

  const product = await Product.findById(productId)
  if (!product || !product.isActive) {
    return res.status(404).json({ message: 'Product not found' })
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id })

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: [productId]
    })
    return res.json({ message: 'Added to wishlist', added: true })
  }

  const isInWishlist = wishlist.products
    .map((p) => p.toString())
    .includes(productId)

  if (isInWishlist) {
    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    )
    await wishlist.save()
    return res.json({ message: 'Removed from wishlist', added: false })
  }

  wishlist.products.push(productId)
  await wishlist.save()
  res.json({ message: 'Added to wishlist', added: true })
})

// ── GET /api/wishlist/ids ─────────────────────────────────
// Lightweight endpoint — returns only product IDs
// Used by frontend to highlight wishlisted products on catalog
export const getWishlistIds = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).select(
    'products'
  )
  res.json({ ids: wishlist?.products ?? [] })
})
