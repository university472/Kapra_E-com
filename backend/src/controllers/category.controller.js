import Category from '../models/Category.js'
import asyncHandler from '../utils/asyncHandler.js'
import slugify from 'slugify'
import { upload } from '../config/cloudinary.js'

// ── GET /api/categories ──────────────────────────────────
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('parent', 'name slug')
    .sort({ name: 1 })
    .lean()

  // Build tree structure: top-level + their children
  const topLevel = categories.filter((c) => !c.parent)
  const tree = topLevel.map((parent) => ({
    ...parent,
    children: categories.filter(
      (c) => c.parent?._id.toString() === parent._id.toString()
    )
  }))

  res.json(tree)
})

// ── GET /api/categories/:slug ────────────────────────────
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    slug: req.params.slug,
    isActive: true
  }).populate('parent', 'name slug')

  if (!category) return res.status(404).json({ message: 'Category not found' })
  res.json(category)
})

// ── POST /api/categories  (Admin) ────────────────────────
export const createCategory = asyncHandler(async (req, res) => {
  const { name, parent, isActive } = req.body
  const image = req.file?.path ?? null

  const slug = slugify(name, { lower: true, strict: true })
  const exists = await Category.findOne({ slug })
  if (exists)
    return res.status(400).json({ message: 'Category slug already exists' })

  const category = await Category.create({
    name,
    slug,
    image,
    parent: parent || null,
    isActive: isActive !== 'false'
  })

  res.status(201).json(category)
})

// ── PUT /api/categories/:id  (Admin) ─────────────────────
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) return res.status(404).json({ message: 'Category not found' })

  if (req.body.name) category.name = req.body.name
  if (req.body.parent) category.parent = req.body.parent
  if (req.body.isActive !== undefined) category.isActive = req.body.isActive
  if (req.file?.path) category.image = req.file.path

  if (req.body.name) {
    category.slug = slugify(req.body.name, { lower: true, strict: true })
  }

  const updated = await category.save()
  res.json(updated)
})

// ── DELETE /api/categories/:id  (Admin) ──────────────────
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) return res.status(404).json({ message: 'Category not found' })

  category.isActive = false
  await category.save()
  res.json({ message: 'Category deactivated' })
})
