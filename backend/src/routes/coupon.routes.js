import express from 'express'
import {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} from '../controllers/coupon.controller.js'
import {
  protect,
  adminOnly,
  optionalAuth
} from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/validate', optionalAuth, validateCoupon)

router.use(protect, adminOnly)
router.get('/', getAllCoupons)
router.post('/', createCoupon)
router.put('/:id', updateCoupon)
router.delete('/:id', deleteCoupon)

export default router
