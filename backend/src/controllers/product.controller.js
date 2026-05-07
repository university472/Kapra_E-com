import Product from '../models/Product.js'
import cloudinary from '../config/cloudinary.js'
import asyncHandler from '../utils/asyncHandler.js'
import slugify from 'slugify'
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js' // For handling image uploads in create/update routes

// ── GET /api/products ────────────────────────────────────
// Supports: ?page, ?limit, ?fabricType, ?category, ?minPrice,
//           ?maxPrice, ?color, ?yardage, ?gsm, ?occasion,
//           ?sort, ?featured
export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    fabricType,
    category,
    minPrice,
    maxPrice,
    color,
    yardage,
    gsm,
    occasion,
    sort = 'createdAt_desc',
    featured
  } = req.query

  // ── Build filter object ──────────────────────────────
  const filter = { isActive: true }

  if (fabricType) filter.fabricType = { $in: fabricType.split(',') }
  if (category) filter.category = category
  if (color) filter.colors = { $in: color.split(',') }
  if (yardage) filter.yardage = { $in: yardage.split(',').map(Number) }
  if (occasion) filter.occasion = occasion
  if (gsm) filter.gsm = { $lte: Number(gsm) }
  if (featured === 'true') filter.isFeatured = true

  if (minPrice || maxPrice) {
    filter.price = {}
    if (minPrice) filter.price.$gte = Number(minPrice)
    if (maxPrice) filter.price.$lte = Number(maxPrice)
  }

  // ── Build sort object ────────────────────────────────
  const sortMap = {
    createdAt_desc: { createdAt: -1 },
    createdAt_asc: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    name_asc: { name: 1 }
  }
  const sortObj = sortMap[sort] || { createdAt: -1 }

  // ── Paginate ─────────────────────────────────────────
  const skip = (Number(page) - 1) * Number(limit)
  const total = await Product.countDocuments(filter)

  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit))
    .lean()

  res.json({
    products,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      hasNext: Number(page) < Math.ceil(total / Number(limit)),
      hasPrev: Number(page) > 1
    }
  })
})

// ── GET /api/products/:id ────────────────────────────────
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    'category',
    'name slug'
  )

  if (!product || !product.isActive) {
    return res.status(404).json({ message: 'Product not found' })
  }
  res.json(product)
})

// ── GET /api/products/slug/:slug ─────────────────────────
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true
  }).populate('category', 'name slug')

  if (!product) return res.status(404).json({ message: 'Product not found' })
  res.json(product)
})

// ── POST /api/products  (Admin) ───────────────────────────
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    salePrice,
    category,
    brand,
    fabricType,
    gsm,
    yardage,
    colors,
    washCare,
    stock,
    isFeatured,
    tags,
    occasion
  } = req.body

  // Images come from Cloudinary via multer middleware
  const imageUploads = req.files?.length
    ? await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer))
      )
    : []

  console.log('Number of files received:', req.files?.length)
  console.log('Cloudinary upload results:', imageUploads)

  const images = imageUploads.map((result) => result.secure_url)

  const slug = slugify(name, { lower: true, strict: true })

  // Ensure slug uniqueness
  const existing = await Product.findOne({ slug })
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug

  const product = await Product.create({
    name,
    slug: finalSlug,
    description,
    images,
    price: Number(price),
    salePrice: salePrice ? Number(salePrice) : null,
    category,
    brand,
    fabricType,
    gsm: gsm ? Number(gsm) : undefined,
    yardage: yardage ? Number(yardage) : undefined,
    colors: colors ? JSON.parse(colors) : [],
    washCare,
    stock: Number(stock),
    isFeatured: isFeatured === 'true',
    tags: tags ? JSON.parse(tags) : [],
    occasion
  })

  res.status(201).json(product)
})

// ── PUT /api/products/:id  (Admin) ───────────────────────
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ message: 'Product not found' })

  const fields = [
    'name',
    'description',
    'price',
    'salePrice',
    'category',
    'brand',
    'fabricType',
    'gsm',
    'yardage',
    'washCare',
    'stock',
    'isFeatured',
    'isActive',
    'tags',
    'occasion'
  ]

  fields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field]
  })

  // Colors & tags arrive as JSON strings from form-data
  if (req.body.colors) product.colors = JSON.parse(req.body.colors)
  if (req.body.tags) product.tags = JSON.parse(req.body.tags)

  // New images uploaded
  if (req.files?.length) {
    const newUploads = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer))
    )
    const newImages = newUploads.map((result) => result.secure_url)
    product.images = [...product.images, ...newImages]
  }

  // Remove specific images
  if (req.body.removeImages) {
    const toRemove = JSON.parse(req.body.removeImages)
    // Delete from Cloudinary
    for (const url of toRemove) {
      const publicId = url.split('/').slice(-2).join('/').split('.')[0]
      await cloudinary.uploader.destroy(publicId)
    }
    product.images = product.images.filter((img) => !toRemove.includes(img))
  }

  // Re-slug if name changed
  if (req.body.name) {
    product.slug = slugify(req.body.name, { lower: true, strict: true })
  }

  const updated = await product.save()
  res.json(updated)
})

// ── DELETE /api/products/:id  (Admin) ────────────────────
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ message: 'Product not found' })

  // Soft delete — keeps order history intact
  product.isActive = false
  await product.save()

  res.json({ message: 'Product deactivated successfully' })
})

// ── GET /api/products/filters/meta ───────────────────────
// Returns all unique filter values for the sidebar
export const getFilterMeta = asyncHandler(async (req, res) => {
  const [fabricTypes, colors, yardages, occasions, priceRange] =
    await Promise.all([
      Product.distinct('fabricType', { isActive: true }),
      Product.distinct('colors', { isActive: true }),
      Product.distinct('yardage', { isActive: true }),
      Product.distinct('occasion', { isActive: true }),
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            min: { $min: '$price' },
            max: { $max: '$price' }
          }
        }
      ])
    ])

  res.json({
    fabricTypes,
    colors: colors.flat(),
    yardages: yardages.sort((a, b) => a - b),
    occasions,
    priceRange: {
      min: priceRange[0]?.min ?? 0,
      max: priceRange[0]?.max ?? 10000
    }
  })
})
