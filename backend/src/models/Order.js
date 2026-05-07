import mongoose from 'mongoose'
import { nanoid } from 'nanoid'

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  image: { type: String },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
})

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      default: () => `KPR-${nanoid(8).toUpperCase()}`
    },
    // Null for guest orders
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Guest info (required if no user)
    guestInfo: {
      name: String,
      email: String,
      phone: String
    },

    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      district: String,
      province: String
    },

    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    paymentMethod: {
      type: String,
      enum: ['COD', 'JazzCash', 'Easypaisa', 'BankTransfer'],
      default: 'COD'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'packed',
        'shipped',
        'delivered',
        'cancelled',
        'returned'
      ],
      default: 'pending'
    },

    trackingNumber: { type: String, default: null },
    notes: { type: String },
    returnRequest: {
      requested: { type: Boolean, default: false },
      reason: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      requestedAt: Date
    }
  },
  { timestamps: true }
)

export default mongoose.model('Order', orderSchema)
