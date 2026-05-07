import express from 'express'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cart.controller.js'
import { optionalAuth } from '../middleware/auth.middleware.js'

const router = express.Router()

// All cart routes use optionalAuth — works for both guests and users
router.use(optionalAuth)

router.get('/', getCart)
router.post('/add', addToCart)
router.put('/update', updateCartItem)
router.delete('/remove/:productId', removeFromCart)
router.delete('/clear', clearCart)

export default router
