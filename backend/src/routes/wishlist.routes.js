import express from 'express'
import {
  getWishlist,
  toggleWishlist,
  getWishlistIds
} from '../controllers/wishlist.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

// All wishlist routes require login
router.use(protect)

router.get('/', getWishlist)
router.get('/ids', getWishlistIds)
router.post('/toggle/:productId', toggleWishlist)

export default router
