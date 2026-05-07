import express from 'express'
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFilterMeta
} from '../controllers/product.controller.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'
import { upload } from '../config/cloudinary.js'

// ── ADDED for restock alert route ────────────────────────
import asyncHandler from '../utils/asyncHandler.js'
import Product from '../models/Product.js'
import RestockAlert from '../models/RestockAlert.js'

const router = express.Router()

// Public
router.get('/', getProducts)
router.get('/filters/meta', getFilterMeta)
router.get('/slug/:slug', getProductBySlug)
router.get('/:id', getProductById)

// Admin protected
router.post(
  '/',
  protect,
  adminOnly,
  upload.array('images', 8), // up to 8 images per product
  createProduct
)

router.put('/:id', protect, adminOnly, upload.array('images', 8), updateProduct)

router.delete('/:id', protect, adminOnly, deleteProduct)

// ── ADDED: Restock alert route (public) ──────────────────
router.post(
  '/:id/restock-alert',
  asyncHandler(async (req, res) => {
    const { email, name } = req.body
    if (!email) return res.status(400).json({ message: 'Email required' })

    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    if (product.stock > 0) {
      return res.status(400).json({ message: 'Product is already in stock!' })
    }

    try {
      await RestockAlert.create({ product: req.params.id, email, name })
      res.json({
        message: "We'll notify you when this product is back in stock! 🔔"
      })
    } catch (err) {
      // Duplicate key error (unique index on product+email)
      res
        .status(400)
        .json({ message: "You're already on the notify list for this product" })
    }
  })
)

export default router
