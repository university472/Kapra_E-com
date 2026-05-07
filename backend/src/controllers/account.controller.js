import Address from '../models/Address.js'
import asyncHandler from '../utils/asyncHandler.js'

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({
    isDefault: -1,
    createdAt: -1
  })
  res.json({ addresses })
})

export const createAddress = asyncHandler(async (req, res) => {
  const {
    label,
    fullName,
    phone,
    street,
    city,
    district,
    province,
    isDefault
  } = req.body

  if (isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false })
  }

  const address = await Address.create({
    user: req.user._id,
    label: label || 'Home',
    fullName,
    phone,
    street,
    city,
    district: district || undefined,
    province: province || undefined,
    isDefault: isDefault || false
  })
  res.status(201).json(address)
})

export const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id
  })
  if (!address) return res.status(404).json({ message: 'Address not found' })

  Object.assign(address, req.body)
  await address.save()
  res.json(address)
})

export const deleteAddress = asyncHandler(async (req, res) => {
  await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id })
  res.json({ message: 'Address deleted' })
})

export const setDefaultAddress = asyncHandler(async (req, res) => {
  await Address.updateMany({ user: req.user._id }, { isDefault: false })
  const address = await Address.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isDefault: true },
    { new: true }
  )
  if (!address) return res.status(404).json({ message: 'Not found' })
  res.json(address)
})
