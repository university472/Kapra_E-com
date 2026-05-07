import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    images: [{ type: String }], // Cloudinary URLs
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: null },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    brand: { type: String, default: 'Unbranded' },
    fabricType: {
      type: String,
      enum: [
        'lawn',
        'khaddar',
        'cotton',
        'chiffon',
        'silk',
        'organza',
        'linen'
      ],
      required: true
    },
    gsm: { type: Number }, // Fabric weight in GSM
    yardage: { type: Number, enum: [2.5, 3, 3.5] }, // Meters
    colors: [{ type: String }],
    washCare: { type: String },
    stock: { type: Number, required: true, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
    // Add these fields to existing productSchema:
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    ratingDist: {
      type: Object,
      default: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    },
    occasion: {
      type: String,
      enum: ['casual', 'formal', 'bridal', 'eid', 'party', 'everyday']
    }
  },
  { timestamps: true }
)

// Full-text search index
productSchema.index({ name: 'text', description: 'text', tags: 'text' })

export default mongoose.model('Product', productSchema)
