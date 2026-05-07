import mongoose from 'mongoose'

const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String },
  isActive: { type: Boolean, default: true },
  source: {
    type: String,
    enum: ['popup', 'footer', 'checkout'],
    default: 'footer'
  },
  subscribedAt: { type: Date, default: Date.now }
})

export default mongoose.model('Newsletter', newsletterSchema)
                                                                                                                                                                                                