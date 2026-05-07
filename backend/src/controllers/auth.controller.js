import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import asyncHandler from '../utils/asyncHandler.js'
import { generateOTP } from '../utils/generateOTP.js'
import { sendEmail, otpEmailTemplate } from '../utils/sendEmail.js'
import {
  sendTokens,
  generateAccessToken,
  generateRefreshToken
} from '../utils/generateTokens.js'
import jwt from 'jsonwebtoken'

// ── Register → Send OTP ──────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body

  const existing = await User.findOne({ email })
  if (existing && existing.isVerified) {
    return res.status(400).json({ message: 'Email already registered' })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const otp = generateOTP()
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 min

  let user
  if (existing && !existing.isVerified) {
    // Re-send OTP to unverified account
    existing.name = name
    existing.phone = phone
    existing.passwordHash = passwordHash
    existing.otp = otp
    existing.otpExpiry = otpExpiry
    user = await existing.save()
  } else {
    user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      otp,
      otpExpiry
    })
  }

  await sendEmail({
    to: email,
    subject: 'Verify your Kapra Store account',
    html: otpEmailTemplate(otp, name)
  })

  res.status(201).json({ message: 'OTP sent to email', email })
})

// ── Verify OTP ───────────────────────────────────────────
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body

  const user = await User.findOne({ email })
  if (!user) return res.status(404).json({ message: 'User not found' })
  if (user.isVerified)
    return res.status(400).json({ message: 'Already verified' })
  if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' })
  if (user.otpExpiry < new Date())
    return res.status(400).json({ message: 'OTP expired' })

  user.isVerified = true
  user.otp = undefined
  user.otpExpiry = undefined
  await user.save()

  const { accessToken } = sendTokens(res, user)

  res.json({
    message: 'Email verified successfully',
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  })
})

// ── Login ────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })
  if (!user.isVerified)
    return res.status(401).json({ message: 'Please verify your email first' })

  const isMatch = await bcrypt.compare(password, user.passwordHash)
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' })

  const { accessToken } = sendTokens(res, user)

  res.json({
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  })
})

// ── Logout ───────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken')
  res.json({ message: 'Logged out successfully' })
})

// ── Get Me ───────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    '-passwordHash -otp -otpExpiry -refreshToken'
  )
  res.json(user)
})

// ── Refresh Token ────────────────────────────────────────
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken
  if (!token) return res.status(401).json({ message: 'No refresh token' })

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
  const user = await User.findById(decoded.id)
  if (!user) return res.status(401).json({ message: 'User not found' })

  const accessToken = generateAccessToken(user._id, user.role)
  res.json({ accessToken })
})

// ── Resend OTP ───────────────────────────────────────────
export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (!user) return res.status(404).json({ message: 'User not found' })
  if (user.isVerified)
    return res.status(400).json({ message: 'Already verified' })

  const otp = generateOTP()
  user.otp = otp
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
  await user.save()

  await sendEmail({
    to: email,
    subject: 'Your new OTP — Kapra Store',
    html: otpEmailTemplate(otp, user.name)
  })

  res.json({ message: 'New OTP sent' })
})
