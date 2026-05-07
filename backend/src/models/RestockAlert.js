// src/models/RestockAlert.js
import mongoose from 'mongoose'

const restockAlertSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  email: { type: String, required: true, lowercase: true },
  name: { type: String },
  notified: { type: Boolean, default: false },
  notifiedAt: Date,
  createdAt: { type: Date, default: Date.now }
})

restockAlertSchema.index({ product: 1, email: 1 }, { unique: true })
export default mongoose.model('RestockAlert', restockAlertSchema)
