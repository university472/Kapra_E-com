import express from 'express'
import {
  getProductReviews,
  createReview,
  toggleHelpful,
  canReview
} from '../controllers/review.controller.js'
import { protect, optionalAuth } from '../middleware/auth.middleware.js'
import { upload } from '../config/cloudinary.js'

const router = express.Router({ mergeParams: true })

router.get('/', getProductReviews)
router.get('/can-review', protect, canReview)
router.post('/', protect, upload.array('images', 3), createReview)
router.patch('/:reviewId/helpful', protect, toggleHelpful)

export default router
