import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendEmail } from '../utils/sendEmail.js'
import {
  orderConfirmationEmail,
  orderStatusUpdateEmail
} from '../utils/orderEmail.js'
import Coupon from '../models/Coupon.js'
// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

const SHIPPING_THRESHOLD = 2999 // Free shipping above this (PKR)
const FLAT_SHIPPING_FEE = 200

// Validate & lock item prices at the moment of order placement
const buildOrderItems = async (cartItems) => {
  const items = []
  const stockUpdates = []

  for (const cartItem of cartItems) {
    const product = await Product.findById(cartItem.product)

    if (!product || !product.isActive) {
      throw new Error(`Product "${cartItem.product}" is no longer available`)
    }
    if (product.stock < cartItem.qty) {
      throw new Error(
        `Only ${product.stock} units of "${product.name}" are in stock`
      )
    }

    // Lock price at purchase time — prevents price-change exploits
    const lockedPrice = product.salePrice ?? product.price

    items.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] ?? '',
      qty: cartItem.qty,
      price: lockedPrice
    })

    stockUpdates.push({
      id: product._id,
      qty: cartItem.qty
    })
  }

  return { items, stockUpdates }
}

// Decrement stock atomically after order is placed
const decrementStock = async (stockUpdates) => {
  for (const { id, qty } of stockUpdates) {
    await Product.findByIdAndUpdate(id, { $inc: { stock: -qty } })
  }
}

// ─────────────────────────────────────────────────────────
// POST /api/orders — Place an Order (Guest or Logged-in)
// ─────────────────────────────────────────────────────────
export const placeOrder = asyncHandler(async (req, res) => {
  const {
    items: rawItems, // Direct items array OR pulled from cart
    shippingAddress,
    paymentMethod = 'COD',
    notes,
    guestInfo, // { name, email, phone } — for guest orders
    useCart = false // If true, pull items from DB cart
  } = req.body

  const userId = req.user?._id
  const sessionId = req.headers['x-session-id']

  // ── 1. Resolve Cart Items ────────────────────────────────
  let cartItems = []

  if (useCart) {
    const query = userId ? { user: userId } : { sessionId }
    const cart = await Cart.findOne(query)

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }
    cartItems = cart.items
  } else {
    // Items passed directly in request body
    if (!rawItems || rawItems.length === 0) {
      return res.status(400).json({ message: 'No items in order' })
    }
    cartItems = rawItems // [{ product: id, qty: N }]
  }

  // ── 2. Validate shipping address ────────────────────────
  const { fullName, phone, street, city } = shippingAddress ?? {}
  if (!fullName || !phone || !street || !city) {
    return res.status(400).json({
      message: 'Shipping address must include fullName, phone, street, and city'
    })
  }

  // ── 3. Guest validation ──────────────────────────────────
  if (!userId) {
    if (!guestInfo?.name || !guestInfo?.phone) {
      return res.status(400).json({
        message: 'Guest orders require guestInfo with name and phone'
      })
    }
  }

  // ── 4. Build & validate items + lock prices ──────────────
  let items, stockUpdates
  try {
    ;({ items, stockUpdates } = await buildOrderItems(cartItems))
  } catch (err) {
    return res.status(400).json({ message: err.message })
  }

  // ── 5. Calculate totals ──────────────────────────────────
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE

  // 🟢 ADDED: Initialize discount
  let discount = 0

  // 🟢 ADDED: Coupon logic (APPLIED HERE)
  if (req.body.couponCode) {
    const coupon = await Coupon.findOne({
      code: req.body.couponCode.toUpperCase(),
      isActive: true
    })

    if (coupon) {
      let disc =
        coupon.type === 'percentage'
          ? (subtotal * coupon.value) / 100
          : coupon.value

      if (coupon.maxDiscount) {
        disc = Math.min(disc, coupon.maxDiscount)
      }

      discount = Math.round(disc)

      // 🟢 ADDED: Mark coupon as used
      await Coupon.findByIdAndUpdate(coupon._id, {
        $inc: { usedCount: 1 },
        $push: { usedBy: userId || undefined }
      })
    }
  }

  // 🟢 UPDATED: Total calculation (WITH discount)
  const total = subtotal + shippingFee - discount

  // ── 6. Create order ──────────────────────────────────────
  const order = await Order.create({
    user: userId ?? null,
    guestInfo: userId ? undefined : guestInfo,
    items,
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingFee,
    total,
    notes,
    orderStatus: 'pending',
    paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending'
  })

  // ── 7. Decrement stock ───────────────────────────────────
  await decrementStock(stockUpdates)

  // ── 8. Clear cart if used ────────────────────────────────
  if (useCart) {
    const query = userId ? { user: userId } : { sessionId }
    await Cart.findOneAndUpdate(query, { items: [] })
  }

  // ── 9. Send confirmation email ───────────────────────────
  const recipientEmail = userId ? req.user.email : guestInfo?.email

  const recipientName = userId ? req.user.name : guestInfo?.name

  if (recipientEmail) {
    sendEmail({
      to: recipientEmail,
      subject: `✅ Order Confirmed — ${order.orderId} | Kapra Store`,
      html: orderConfirmationEmail(order, recipientName)
    }).catch(() => {}) // Non-blocking — don't fail order on email error
  }

  res.status(201).json({
    message: 'Order placed successfully! 🎉',
    orderId: order.orderId,
    _id: order._id,
    total: order.total,
    paymentMethod: order.paymentMethod
  })
})

// ─────────────────────────────────────────────────────────
// GET /api/orders/track?orderId=KPR-XXX&phone=03001234567
// Guest order tracking — no auth required
// ─────────────────────────────────────────────────────────
export const trackOrder = asyncHandler(async (req, res) => {
  const { orderId, phone } = req.query

  if (!orderId || !phone) {
    return res.status(400).json({
      message: 'orderId and phone are required'
    })
  }

  const order = await Order.findOne({ orderId })
    .populate('items.product', 'name images fabricType')
    .lean()

  if (!order) {
    return res.status(404).json({ message: 'Order not found' })
  }

  // Verify phone matches — guest or registered user
  const orderPhone = order.guestInfo?.phone || order.shippingAddress?.phone

  if (orderPhone !== phone) {
    return res.status(403).json({
      message: 'Phone number does not match this order'
    })
  }

  // Return sanitized response — no sensitive data
  res.json({
    orderId: order.orderId,
    orderStatus: order.orderStatus,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    trackingNumber: order.trackingNumber,
    shippingAddress: order.shippingAddress,
    items: order.items,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    total: order.total,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    // Timeline for the order status stepper UI
    timeline: buildTimeline(order.orderStatus)
  })
})

// Status timeline helper for frontend stepper component
const buildTimeline = (currentStatus) => {
  const steps = ['pending', 'confirmed', 'packed', 'shipped', 'delivered']
  const cancelledSteps = ['pending', 'cancelled']
  const returnedSteps = [
    'pending',
    'confirmed',
    'packed',
    'shipped',
    'delivered',
    'returned'
  ]

  let flow = steps
  if (currentStatus === 'cancelled') flow = cancelledSteps
  if (currentStatus === 'returned') flow = returnedSteps

  const currentIdx = flow.indexOf(currentStatus)

  return flow.map((step, idx) => ({
    status: step,
    completed: idx <= currentIdx,
    active: idx === currentIdx
  }))
}

// ─────────────────────────────────────────────────────────
// GET /api/orders/my — Logged-in user's orders
// ─────────────────────────────────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query
  const filter = { user: req.user._id }
  if (status) filter.orderStatus = status

  const skip = (Number(page) - 1) * Number(limit)
  const total = await Order.countDocuments(filter)

  const orders = await Order.find(filter)
    .select('orderId items subtotal total orderStatus paymentMethod createdAt')
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean()

  res.json({
    orders,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    }
  })
})

// ─────────────────────────────────────────────────────────
// GET /api/orders/:id — Single order detail (owner or admin)
// ─────────────────────────────────────────────────────────
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name images fabricType yardage')
    .populate('user', 'name email phone')
    .lean()

  if (!order) return res.status(404).json({ message: 'Order not found' })

  // Only the order owner or admin can view it
  const isOwner = order.user?._id?.toString() === req.user._id.toString()
  const isAdmin = req.user.role === 'admin'

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Access denied' })
  }

  res.json({ ...order, timeline: buildTimeline(order.orderStatus) })
})

// ─────────────────────────────────────────────────────────
// POST /api/orders/:id/return — Submit a return request
// ─────────────────────────────────────────────────────────
export const requestReturn = asyncHandler(async (req, res) => {
  const { reason } = req.body

  if (!reason || reason.trim().length < 10) {
    return res.status(400).json({
      message: 'Please provide a reason (at least 10 characters)'
    })
  }

  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })

  // Only the owner can request a return
  if (order.user?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' })
  }

  // Only delivered orders can be returned
  if (order.orderStatus !== 'delivered') {
    return res.status(400).json({
      message: 'Only delivered orders can be returned'
    })
  }

  // 7-day return window
  const deliveredAt = order.updatedAt
  const daysSince = (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSince > 7) {
    return res.status(400).json({
      message: 'Return window has expired (7 days from delivery)'
    })
  }

  if (order.returnRequest?.requested) {
    return res.status(400).json({
      message: 'A return request has already been submitted for this order'
    })
  }

  order.returnRequest = {
    requested: true,
    reason: reason.trim(),
    status: 'pending',
    requestedAt: new Date()
  }

  await order.save()

  res.json({
    message:
      'Return request submitted successfully. We will review it within 24 hours.',
    returnRequest: order.returnRequest
  })
})

// ─────────────────────────────────────────────────────────
// PATCH /api/orders/:id/cancel — Cancel own order
// Only allowed if order is still "pending"
// ─────────────────────────────────────────────────────────
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })

  if (order.user?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' })
  }

  if (order.orderStatus !== 'pending') {
    return res.status(400).json({
      message: `Order cannot be cancelled — current status: ${order.orderStatus}`
    })
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } })
  }

  order.orderStatus = 'cancelled'
  await order.save()

  res.json({ message: 'Order cancelled successfully' })
})
