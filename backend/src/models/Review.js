import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 100 },
    body: { type: String, trim: true, maxlength: 1000 },
    images: [{ type: String }], // Cloudinary URLs
    isVerifiedPurchase: { type: Boolean, default: true },
    helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    adminReply: {
      body: String,
      repliedAt: Date
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved' // Auto-approve for now
    }
  },
  { timestamps: true }
)

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true })

// Recalculate product average rating after save/delete
reviewSchema.post('save', async function () {
  await updateProductRating(this.product)
})
reviewSchema.post('deleteOne', { document: true }, async function () {
  await updateProductRating(this.product)
})

async function updateProductRating(productId) {
  const Review = mongoose.model('Review')
  const Product = mongoose.model('Product')

  const stats = await Review.aggregate([
    { $match: { product: productId, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
        dist: {
          $push: '$rating'
        }
      }
    }
  ])

  if (stats.length > 0) {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    stats[0].dist.forEach((r) => dist[r]++)

    await Product.findByIdAndUpdate(productId, {
      avgRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].reviewCount,
      ratingDist: dist
    })
  } else {
    await Product.findByIdAndUpdate(productId, {
      avgRating: 0,
      reviewCount: 0
    })
  }
}

export default mongoose.model('Review', reviewSchema)
