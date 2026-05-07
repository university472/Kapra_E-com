import Coupon from '../models/Coupon.js'
import asyncHandler from '../utils/asyncHandler.js'

// POST /api/coupons/validate — called from checkout
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal, userId } = req.body

  const coupon = await Coupon.findOne({
    code: code.toUpperCase().trim(),
    isActive: true
  })

  if (!coupon) {
    return res.status(404).json({ message: 'Coupon not found or expired' })
  }

  // Expiry check
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return res.status(400).json({ message: 'This coupon has expired' })
  }

  // Max uses check
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return res
      .status(400)
      .json({ message: 'This coupon has reached its usage limit' })
  }

  // One per user check
  if (coupon.onePerUser && userId) {
    const alreadyUsed = coupon.usedBy
      .map((id) => id.toString())
      .includes(userId)
    if (alreadyUsed) {
      return res
        .status(400)
        .json({ message: 'You have already used this coupon' })
    }
  }

  // Minimum order check
  if (subtotal < coupon.minOrderAmount) {
    return res.status(400).json({
      message: `Minimum order of Rs. ${coupon.minOrderAmount.toLocaleString()} required for this coupon`
    })
  }

  // Calculate discount
  let discount = 0
  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.value) / 100
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount)
    }
  } else {
    discount = Math.min(coupon.value, subtotal)
  }

  discount = Math.round(discount)

  res.json({
    valid: true,
    couponId: coupon._id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount,
    description: coupon.description,
    message: `Coupon applied! You save Rs. ${discount.toLocaleString()}`
  })
})

// ── Admin CRUD ───────────────────────────────────────────

export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 })
  res.json({ coupons })
})

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body)
  res.status(201).json(coupon)
})

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  })
  res.json(coupon)
})

export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id)
  res.json({ message: 'Coupon deleted' })
})
