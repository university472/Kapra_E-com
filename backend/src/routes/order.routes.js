import express from 'express'
import {
  placeOrder,
  trackOrder,
  getMyOrders,
  getOrderById,
  requestReturn,
  cancelOrder
} from '../controllers/order.controller.js'
import { protect, optionalAuth } from '../middleware/auth.middleware.js'
import { body } from 'express-validator'
import { validateRequest } from '../middleware/validateRequest.js'
import asyncHandler from 'express-async-handler' // ← ADDED for invoice route
import Order from '../models/Order.js' // ← ADDED for invoice route
import { generateInvoicePDF } from '../utils/generateInvoice.js' // ← ADDED for invoice route

const router = express.Router()

// ── Public (guest order tracking — no auth) ──────────────
router.get('/track', trackOrder)

// ── Place order — works for guests AND logged-in users ───
router.post(
  '/',
  optionalAuth,
  [
    body('shippingAddress.fullName')
      .notEmpty()
      .withMessage('Full name required'),
    body('shippingAddress.phone').notEmpty().withMessage('Phone required'),
    body('shippingAddress.street')
      .notEmpty()
      .withMessage('Street address required'),
    body('shippingAddress.city').notEmpty().withMessage('City required'),
    body('paymentMethod')
      .optional()
      .isIn(['COD', 'JazzCash', 'Easypaisa', 'BankTransfer'])
      .withMessage('Invalid payment method')
  ],
  validateRequest,
  placeOrder
)

// ── Protected — require login ────────────────────────────
router.use(protect)

router.get('/my', getMyOrders)
router.get('/:id', getOrderById)
router.post('/:id/return', requestReturn)
router.patch('/:id/cancel', cancelOrder)

// ── ADDED: Invoice download route ─────────────────────────
router.get(
  '/:id/invoice',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    const isOwner = order.user?.toString() === req.user._id.toString()
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    generateInvoicePDF(order, res)
  })
)

export default router
