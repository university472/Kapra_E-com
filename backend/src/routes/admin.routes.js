import express from 'express'
import {
  getDashboard,
  getAllOrders,
  updateOrderStatus,
  handleReturnRequest,
  getAllUsers,
  updateUserRole,
  getAdminProducts
} from '../controllers/admin.controller.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'
import { body } from 'express-validator'
import { validateRequest } from '../middleware/validateRequest.js'

const router = express.Router()

// All admin routes require login + admin role
router.use(protect, adminOnly)

// Dashboard
router.get('/dashboard', getDashboard)

// Orders
router.get('/orders', getAllOrders)
router.patch(
  '/orders/:id/status',
  [body('status').notEmpty().withMessage('status is required')],
  validateRequest,
  updateOrderStatus
)
router.patch(
  '/orders/:id/return',
  [
    body('decision')
      .isIn(['approved', 'rejected'])
      .withMessage('decision must be approved or rejected')
  ],
  validateRequest,
  handleReturnRequest
)

// Products
router.get('/products', getAdminProducts)

// Users
router.get('/users', getAllUsers)
router.patch('/users/:id/role', updateUserRole)

export default router
