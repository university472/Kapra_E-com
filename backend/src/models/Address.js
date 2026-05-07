import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    district: String,
    province: String,
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export default mongoose.model('Address', addressSchema)
