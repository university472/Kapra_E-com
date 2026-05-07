import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Star,
  ThumbsUp,
  Camera,
  MessageCircle,
  CheckCircle2,
  Send,
  X
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../../api/axios'
import { useAuthStore } from '../../stores/authStore'
import { StarRating, RatingBar } from './StarRating'
import { toast } from 'sonner'

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().max(100).optional(),
  body: z.string().min(10, 'Review must be at least 10 characters').max(1000),
  orderId: z.string().min(1, 'Please select the order')
})

export default function ReviewSection({
  productId,
  avgRating,
  reviewCount,
  ratingDist
}) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [reviews, setReviews] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('recent')
  const [page, setPage] = useState(1)
  const [canReview, setCanReview] = useState(false)
  const [eligibleOrders, setEligibleOrders] = useState([])
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewImages, setReviewImages] = useState([])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm({ resolver: zodResolver(reviewSchema) })

  // ───── declare data‑fetching functions BEFORE the effect ─────
  const fetchReviews = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(
        `/reviews/${productId}?page=${page}&limit=5&sort=${sort}`
      )
      setReviews(data.reviews)
      setPagination(data.pagination)
    } catch {
      /* network or server error – silently ignore */
    } finally {
      setLoading(false)
    }
  }

  const checkEligibility = async () => {
    try {
      const { data } = await api.get(`/reviews/${productId}/can-review`)
      setCanReview(data.canReview)
      setEligibleOrders(data.eligibleOrders || [])
      setAlreadyReviewed(data.alreadyReviewed)
    } catch {
      /* silently ignore */
    }
  }

  useEffect(() => {
    const load = async () => {
      await fetchReviews()
      if (isAuthenticated()) await checkEligibility()
    }

    void Promise.resolve().then(load)
    // we intentionally only want to re‑run on sort/page changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, page])

  const onSubmit = async (data) => {
    if (selectedRating === 0) {
      toast.error('Please select a star rating')
      return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('rating', selectedRating)
      fd.append('title', data.title || '')
      fd.append('body', data.body)
      fd.append('orderId', data.orderId)
      reviewImages.forEach((f) => fd.append('images', f))

      await api.post(`/reviews/${productId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Review submitted! Thank you 🎉')
      setShowForm(false)
      reset()
      setSelectedRating(0)
      setReviewImages([])
      setAlreadyReviewed(true)
      setCanReview(false)
      fetchReviews()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleHelpful = async (reviewId, idx) => {
    if (!isAuthenticated()) {
      toast.error('Please login to vote')
      return
    }
    try {
      const { data } = await api.patch(
        `/reviews/${productId}/${reviewId}/helpful`
      )
      setReviews((prev) =>
        prev.map((r, i) =>
          i === idx ? { ...r, helpfulCount: data.helpfulCount } : r
        )
      )
    } catch {
      /* silently ignore */
    }
  }

  const totalReviews = reviewCount || 0

  return (
    <section className="mt-14 max-w-3xl">
      <h2
        className="font-display text-2xl font-bold text-gray-900 mb-6
                     flex items-center gap-2"
      >
        <MessageCircle size={22} className="text-brand-500" />
        Customer Reviews
        {totalReviews > 0 && (
          <span className="text-base font-normal text-gray-400">
            ({totalReviews})
          </span>
        )}
      </h2>

      {/* ── Rating Overview ──────────────────────────── */}
      {totalReviews > 0 && (
        <div
          className="bg-white rounded-2xl border border-gray-100
                        shadow-sm p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Big number */}
            <div className="text-center shrink-0">
              <p className="font-display text-6xl font-bold text-gray-900 leading-none">
                {avgRating?.toFixed(1) || '0.0'}
              </p>
              <StarRating
                rating={avgRating || 0}
                size={20}
                className="justify-center mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Distribution bars */}
            <div className="flex-1 w-full space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <RatingBar
                  key={star}
                  label={star}
                  count={ratingDist?.[star] || 0}
                  total={totalReviews}
                  color={
                    star >= 4
                      ? 'bg-green-400'
                      : star === 3
                        ? 'bg-yellow-400'
                        : 'bg-red-400'
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Write Review CTA ─────────────────────────── */}
      {isAuthenticated() ? (
        canReview && !showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2
                       bg-brand-500 text-white py-3.5 rounded-2xl
                       font-bold hover:bg-brand-600 transition-colors
                       mb-6 shadow-sm"
          >
            <Star size={18} />
            Write a Review
          </button>
        ) : alreadyReviewed ? (
          <div
            className="flex items-center gap-2 text-green-700 bg-green-50
                          border border-green-200 rounded-2xl px-5 py-3.5
                          mb-6 font-medium text-sm"
          >
            <CheckCircle2 size={18} />
            You've already reviewed this product
          </div>
        ) : !canReview && !alreadyReviewed ? (
          <div
            className="bg-gray-50 border border-gray-200 rounded-2xl
                          px-5 py-4 mb-6 text-sm text-gray-600"
          >
            Purchase and receive this product to leave a review
          </div>
        ) : null
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center gap-2
                     border-2 border-brand-300 text-brand-600 py-3.5
                     rounded-2xl font-bold hover:bg-brand-50
                     transition-colors mb-6 text-sm"
        >
          Login to write a review
        </button>
      )}

      {/* ── Review Form ──────────────────────────────── */}
      {showForm && (
        <div
          className="bg-white rounded-2xl border border-brand-200
                        shadow-md p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">Your Review</h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Star picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setSelectedRating(star)
                      setValue('rating', star)
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={36}
                      className={
                        star <= (hoverRating || selectedRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-100 text-gray-300'
                      }
                    />
                  </button>
                ))}
              </div>
              {selectedRating > 0 && (
                <p className="text-xs text-amber-600 mt-1 font-medium">
                  {
                    ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][
                      selectedRating
                    ]
                  }
                </p>
              )}
            </div>

            {/* Order select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Select Order *
              </label>
              <select
                {...register('orderId')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200
                           text-sm bg-gray-50 focus:bg-white focus:outline-none
                           focus:ring-2 focus:ring-brand-300"
              >
                <option value="">Select your order</option>
                {eligibleOrders.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.orderId}
                  </option>
                ))}
              </select>
              {errors.orderId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.orderId.message}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Review Title
              </label>
              <input
                {...register('title')}
                placeholder="Summarize your experience"
                className="w-full px-4 py-3 rounded-xl border border-gray-200
                           text-sm bg-gray-50 focus:bg-white focus:outline-none
                           focus:ring-2 focus:ring-brand-300"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Review *
              </label>
              <textarea
                {...register('body')}
                rows={4}
                placeholder="Tell others about the fabric quality, color accuracy, and your experience..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200
                           text-sm bg-gray-50 focus:bg-white focus:outline-none
                           focus:ring-2 focus:ring-brand-300 resize-none"
              />
              {errors.body && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.body.message}
                </p>
              )}
            </div>

            {/* Photo upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Add Photos (optional)
              </label>
              <label
                className="flex items-center gap-2 w-fit cursor-pointer
                                 px-4 py-2.5 border-2 border-dashed border-gray-300
                                 rounded-xl text-sm text-gray-500
                                 hover:border-brand-400 hover:text-brand-600
                                 transition-colors"
              >
                <Camera size={16} />
                Upload photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) =>
                    setReviewImages(Array.from(e.target.files).slice(0, 3))
                  }
                />
              </label>
              {reviewImages.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {reviewImages.map((f, i) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(f)}
                      alt=""
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-brand-500 text-white
                         px-8 py-3 rounded-xl font-bold text-sm
                         hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <span
                  className="w-4 h-4 border-2 border-white/30
                                 border-t-white rounded-full animate-spin"
                />
              ) : (
                <Send size={15} />
              )}
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* ── Sort Controls ────────────────────────────── */}
      {totalReviews > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-700">
            {totalReviews} Review{totalReviews !== 1 ? 's' : ''}
          </p>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value)
              setPage(1)
            }}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2
                       bg-white focus:outline-none focus:ring-2
                       focus:ring-brand-300"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      )}

      {/* ── Review Cards ─────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 shimmer rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <Star size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 text-sm">
            No reviews yet. Be the first to review!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, idx) => (
            <div
              key={review._id}
              className="bg-white rounded-2xl border border-gray-100
                            shadow-sm p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 bg-gradient-to-br
                                  from-brand-300 to-brand-500 rounded-xl
                                  flex items-center justify-center shrink-0"
                  >
                    <span className="text-white font-bold text-sm">
                      {review.user?.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">
                      {review.user?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={review.rating} size={13} />
                      {review.isVerifiedPurchase && (
                        <span
                          className="flex items-center gap-0.5 text-[10px]
                                         text-green-700 font-semibold"
                        >
                          <CheckCircle2 size={10} />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 shrink-0">
                  {new Date(review.createdAt).toLocaleDateString('en-PK', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {/* Content */}
              {review.title && (
                <h4 className="font-bold text-sm text-gray-800 mb-1">
                  {review.title}
                </h4>
              )}
              <p className="text-sm text-gray-600 leading-relaxed">
                {review.body}
              </p>

              {/* Images */}
              {review.images?.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Review image ${i + 1}`}
                      className="w-16 h-16 object-cover rounded-xl border"
                    />
                  ))}
                </div>
              )}

              {/* Admin reply */}
              {review.adminReply?.body && (
                <div
                  className="mt-3 bg-brand-50 border border-brand-100
                                rounded-xl px-4 py-3"
                >
                  <p className="text-xs font-bold text-brand-700 mb-1">
                    💬 Seller's Response
                  </p>
                  <p className="text-xs text-brand-800 leading-relaxed">
                    {review.adminReply.body}
                  </p>
                </div>
              )}

              {/* Helpful */}
              <div
                className="flex items-center gap-3 mt-3 pt-3
                              border-t border-gray-50"
              >
                <p className="text-xs text-gray-400">
                  Was this review helpful?
                </p>
                <button
                  onClick={() => handleHelpful(review._id, idx)}
                  className="flex items-center gap-1.5 text-xs text-gray-500
                             hover:text-brand-600 font-medium transition-colors"
                >
                  <ThumbsUp size={13} />
                  Helpful ({review.helpfulCount || 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: pagination.totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                          ${
                            page === i + 1
                              ? 'bg-brand-500 text-white'
                              : 'border border-gray-200 text-gray-600 hover:border-brand-300'
                          }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
