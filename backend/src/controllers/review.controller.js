import Review from '../models/Review.js'
import Order from '../models/Order.js'
import asyncHandler from '../utils/asyncHandler.js'
import { upload } from '../config/cloudinary.js'

// GET /api/reviews/:productId — Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const { page = 1, limit = 10, sort = 'recent' } = req.query

  const sortMap = {
    recent: { createdAt: -1 },
    helpful: { helpfulVotes: -1 },
    highest: { rating: -1 },
    lowest: { rating: 1 }
  }

  const skip = (Number(page) - 1) * Number(limit)
  const total = await Review.countDocuments({
    product: productId,
    status: 'approved'
  })

  const reviews = await Review.find({ product: productId, status: 'approved' })
    .populate('user', 'name createdAt')
    .sort(sortMap[sort] || { createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean()

  // Add helpful count and whether current user voted
  const enriched = reviews.map((r) => ({
    ...r,
    helpfulCount: r.helpfulVotes?.length || 0,
    helpfulVotes: undefined // don't expose voter IDs
  }))

  res.json({
    reviews: enriched,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    }
  })
})

// POST /api/reviews/:productId — Auth required
export const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const { rating, title, body, orderId } = req.body

  // Verify user actually purchased this product
  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
    orderStatus: 'delivered',
    'items.product': productId
  })

  if (!order) {
    return res.status(403).json({
      message: 'You can only review products you have purchased and received'
    })
  }

  // Check for existing review
  const existing = await Review.findOne({
    product: productId,
    user: req.user._id
  })
  if (existing) {
    return res.status(400).json({
      message: 'You have already reviewed this product'
    })
  }

  const images = req.files?.map((f) => f.path) ?? []

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    order: orderId,
    rating: Number(rating),
    title: title?.trim(),
    body: body?.trim(),
    images,
    isVerifiedPurchase: true
  })

  await review.populate('user', 'name')
  res.status(201).json(review)
})

// PATCH /api/reviews/:reviewId/helpful — Toggle helpful vote
export const toggleHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId)
  if (!review) return res.status(404).json({ message: 'Review not found' })

  const userId = req.user._id.toString()
  const hasVoted = review.helpfulVotes.map((v) => v.toString()).includes(userId)

  if (hasVoted) {
    review.helpfulVotes = review.helpfulVotes.filter(
      (v) => v.toString() !== userId
    )
  } else {
    review.helpfulVotes.push(req.user._id)
  }

  await review.save()
  res.json({
    helpful: !hasVoted,
    helpfulCount: review.helpfulVotes.length
  })
})

// GET /api/reviews/:productId/can-review — Check eligibility
export const canReview = asyncHandler(async (req, res) => {
  const { productId } = req.params

  const orders = await Order.find({
    user: req.user._id,
    orderStatus: 'delivered',
    'items.product': productId
  }).select('_id orderId')

  const alreadyReviewed = await Review.findOne({
    product: productId,
    user: req.user._id
  })

  res.json({
    canReview: orders.length > 0 && !alreadyReviewed,
    alreadyReviewed: !!alreadyReviewed,
    eligibleOrders: orders
  })
})

// PATCH /api/admin/reviews/:id — Admin reply
export const adminReplyToReview = asyncHandler(async (req, res) => {
  const { body } = req.body
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { adminReply: { body, repliedAt: new Date() } },
    { new: true }
  )
  res.json(review)
})
