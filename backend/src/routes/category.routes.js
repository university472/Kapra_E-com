import express from 'express'
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'
import { upload } from '../config/cloudinary.js'

const router = express.Router()

router.get('/', getCategories)
router.get('/:slug', getCategoryBySlug)

router.post('/', protect, adminOnly, upload.single('image'), createCategory)
router.put('/:id', protect, adminOnly, upload.single('image'), updateCategory)
router.delete('/:id', protect, adminOnly, deleteCategory)

export default router
