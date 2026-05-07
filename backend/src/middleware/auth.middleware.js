import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import asyncHandler from '../utils/asyncHandler.js'

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized — no token' })
  }

  const token = authHeader.split(' ')[1]
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
  req.user = await User.findById(decoded.id).select('-passwordHash -otp')

  if (!req.user) return res.status(401).json({ message: 'User not found' })
  next()
})

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

// Optional auth — attaches user if token present, continues either way
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      req.user = await User.findById(decoded.id).select('-passwordHash -otp')
    } catch {
      req.user = null
    }
  }
  next()
})
