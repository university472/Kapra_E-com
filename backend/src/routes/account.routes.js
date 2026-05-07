import express from 'express'
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/account.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()
router.use(protect)

router.get('/addresses', getAddresses)
router.post('/addresses', createAddress)
router.put('/addresses/:id', updateAddress)
router.delete('/addresses/:id', deleteAddress)
router.patch('/addresses/:id/default', setDefaultAddress)

export default router
