import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  qty: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true }
})

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sessionId: { type: String, default: null }, // For guest carts
    items: [cartItemSchema]
  },
  { timestamps: true }
)

export default mongoose.model('Cart', cartSchema)
