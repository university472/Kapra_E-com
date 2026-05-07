import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import asyncHandler from '../utils/asyncHandler.js'

// Helper: Find or create a cart for the current visitor
const getOrCreateCart = async (userId, sessionId) => {
  const query = userId ? { user: userId } : { sessionId }
  let cart = await Cart.findOne(query)

  if (!cart) {
    cart = await Cart.create({
      user: userId || null,
      sessionId: userId ? null : sessionId,
      items: []
    })
  }
  return cart
}

// Helper: Merge guest cart into user cart on login
export const mergeCartOnLogin = async (userId, sessionId) => {
  if (!sessionId) return

  const guestCart = await Cart.findOne({ sessionId })
  if (!guestCart || guestCart.items.length === 0) return

  let userCart = await Cart.findOne({ user: userId })
  if (!userCart) {
    guestCart.user = userId
    guestCart.sessionId = null
    await guestCart.save()
    return
  }

  // Merge items
  for (const guestItem of guestCart.items) {
    const existingIdx = userCart.items.findIndex(
      (i) => i.product.toString() === guestItem.product.toString()
    )
    if (existingIdx >= 0) {
      userCart.items[existingIdx].qty += guestItem.qty
    } else {
      userCart.items.push(guestItem)
    }
  }

  await userCart.save()
  await Cart.deleteOne({ sessionId })
}

// ── GET /api/cart ────────────────────────────────────────
export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id
  const sessionId = req.headers['x-session-id']

  const cart = await getOrCreateCart(userId, sessionId)

  // Populate product details
  await cart.populate({
    path: 'items.product',
    select: 'name images price salePrice stock fabricType yardage isActive'
  })

  // Filter out inactive/deleted products
  const validItems = cart.items.filter(
    (item) => item.product && item.product.isActive
  )

  if (validItems.length !== cart.items.length) {
    cart.items = validItems
    await cart.save()
  }

  // Calculate totals
  const subtotal = validItems.reduce(
    (sum, item) =>
      sum + (item.product.salePrice || item.product.price) * item.qty,
    0
  )

  const SHIPPING_THRESHOLD = 2999 // Free shipping above this (PKR)
  const SHIPPING_FEE = subtotal >= SHIPPING_THRESHOLD ? 0 : 200

  res.json({
    cart: {
      _id: cart._id,
      items: validItems,
      subtotal,
      shippingFee: SHIPPING_FEE,
      total: subtotal + SHIPPING_FEE,
      itemCount: validItems.reduce((sum, i) => sum + i.qty, 0)
    }
  })
})

// ── POST /api/cart/add ───────────────────────────────────
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty = 1 } = req.body
  const userId = req.user?._id
  const sessionId = req.headers['x-session-id']

  if (!productId) {
    return res.status(400).json({ message: 'productId is required' })
  }

  const product = await Product.findById(productId)
  if (!product || !product.isActive) {
    return res.status(404).json({ message: 'Product not found' })
  }
  if (product.stock < 1) {
    return res.status(400).json({ message: 'Product is out of stock' })
  }

  const cart = await getOrCreateCart(userId, sessionId)
  const effectivePrice = product.salePrice || product.price
  const existingIdx = cart.items.findIndex(
    (i) => i.product.toString() === productId
  )

  if (existingIdx >= 0) {
    const newQty = cart.items[existingIdx].qty + Number(qty)
    if (newQty > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} items available in stock`
      })
    }
    cart.items[existingIdx].qty = newQty
    cart.items[existingIdx].price = effectivePrice
  } else {
    cart.items.push({
      product: productId,
      qty: Number(qty),
      price: effectivePrice
    })
  }

  await cart.save()
  await cart.populate({
    path: 'items.product',
    select: 'name images price salePrice stock fabricType'
  })

  res.json({ message: 'Added to cart', itemCount: cart.items.length })
})

// ── PUT /api/cart/update ─────────────────────────────────
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, qty } = req.body
  const userId = req.user?._id
  const sessionId = req.headers['x-session-id']

  const cart = await getOrCreateCart(userId, sessionId)
  const idx = cart.items.findIndex((i) => i.product.toString() === productId)

  if (idx === -1) {
    return res.status(404).json({ message: 'Item not in cart' })
  }

  if (Number(qty) <= 0) {
    cart.items.splice(idx, 1)
  } else {
    const product = await Product.findById(productId)
    if (Number(qty) > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} available`
      })
    }
    cart.items[idx].qty = Number(qty)
  }

  await cart.save()
  res.json({ message: 'Cart updated', itemCount: cart.items.length })
})

// ── DELETE /api/cart/remove/:productId ───────────────────
export const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id
  const sessionId = req.headers['x-session-id']

  const cart = await getOrCreateCart(userId, sessionId)
  cart.items = cart.items.filter(
    (i) => i.product.toString() !== req.params.productId
  )

  await cart.save()
  res.json({ message: 'Item removed', itemCount: cart.items.length })
})

// ── DELETE /api/cart/clear ───────────────────────────────
export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id
  const sessionId = req.headers['x-session-id']

  const cart = await getOrCreateCart(userId, sessionId)
  cart.items = []
  await cart.save()

  res.json({ message: 'Cart cleared' })
})
