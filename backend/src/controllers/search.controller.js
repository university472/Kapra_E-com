import Product from '../models/Product.js'
import asyncHandler from '../utils/asyncHandler.js'

// ── GET /api/search?q=lawn&limit=10&full=true ────────────
// If full=true → paginated results page
// If full=false (default) → autocomplete suggestions only
export const search = asyncHandler(async (req, res) => {
  const { q, limit = 10, page = 1, full = 'false' } = req.query

  if (!q || q.trim().length < 2) {
    return res.json({ suggestions: [], products: [], total: 0 })
  }

  const query = q.trim()
  const isFullPage = full === 'true'

  // Text search + regex fallback for partial matches
  const filter = {
    isActive: true,
    $or: [
      { $text: { $search: query } },
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } },
      { fabricType: { $regex: query, $options: 'i' } }
    ]
  }

  if (!isFullPage) {
    // Autocomplete: lightweight, fast
    const suggestions = await Product.find(filter)
      .select('name slug images price fabricType')
      .limit(Number(limit))
      .lean()

    return res.json({ suggestions })
  }

  // Full search results with pagination
  const skip = (Number(page) - 1) * Number(limit)
  const total = await Product.countDocuments(filter)

  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean()

  res.json({
    products,
    query,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    }
  })
})
