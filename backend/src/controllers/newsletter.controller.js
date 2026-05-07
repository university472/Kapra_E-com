// backend/src/controllers/newsletter.controller.js
import Newsletter from '../models/Newsletter.js'
import asyncHandler from '../utils/asyncHandler.js'

// Subscribe
export const subscribe = asyncHandler(async (req, res) => {
  const { email, name, source } = req.body
  if (!email) return res.status(400).json({ message: 'Email required' })

  const existing = await Newsletter.findOne({ email })
  if (existing) {
    return res.status(400).json({ message: "You're already subscribed!" })
  }

  await Newsletter.create({ email, name, source })
  res.status(201).json({ message: 'Subscribed successfully! 🎉' })
})

// Unsubscribe (optional)
export const unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.params
  await Newsletter.findOneAndUpdate({ email }, { isActive: false })
  res.json({ message: 'Unsubscribed' })
})

// Admin: get all subscribers
export const getSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Newsletter.find().sort({ subscribedAt: -1 })
  res.json(subscribers)
})
