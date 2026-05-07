// import express from 'express'
// import {
//   subscribe,
//   unsubscribe,
//   getSubscribers
// } from '../controllers/newsletter.controller.js'
// import { protect, admin } from '../middleware/auth.middleware.js'

// const router = express.Router()

// // Public route
// router.post('/subscribe', subscribe)

// // Protected admin routes
// router.get('/subscribers', protect, admin, getSubscribers)
// router.delete('/unsubscribe/:email', protect, admin, unsubscribe)

// export default router

import express from 'express'
import {
  subscribe,
  unsubscribe,
  getSubscribers
} from '../controllers/newsletter.controller.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js' // ← changed from 'admin' to 'adminOnly'

const router = express.Router()

// Public route
router.post('/subscribe', subscribe)

// Protected admin routes
router.get('/subscribers', protect, adminOnly, getSubscribers)
router.delete('/unsubscribe/:email', protect, adminOnly, unsubscribe)

export default router
