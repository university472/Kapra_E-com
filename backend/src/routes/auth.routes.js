import express from 'express'
import {
  register,
  verifyOTP,
  login,
  logout,
  getMe,
  refreshAccessToken,
  resendOTP
} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { body } from 'express-validator'
import { validateRequest } from '../middleware/validateRequest.js'

const router = express.Router()

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
  ],
  validateRequest,
  register
)

router.post(
  '/verify-otp',
  [
    body('email').isEmail(),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  validateRequest,
  verifyOTP
)

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validateRequest,
  login
)

router.post('/logout', logout)
router.get('/me', protect, getMe)
router.post('/refresh', refreshAccessToken)
router.post('/resend-otp', resendOTP)

export default router
