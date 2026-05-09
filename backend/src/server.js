import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
// import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import reviewRoutes from './routes/review.routes.js'
import couponRoutes from './routes/coupon.routes.js'
import newsletterRoutes from './routes/newsletter.routes.js'
// Routes
import authRoutes from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js'
import categoryRoutes from './routes/category.routes.js'
import cartRoutes from './routes/cart.routes.js'
import wishlistRoutes from './routes/wishlist.routes.js'
import orderRoutes from './routes/order.routes.js'
import adminRoutes from './routes/admin.routes.js'
import searchRoutes from './routes/search.routes.js'
import accountRoutes from './routes/account.routes.js'

// dotenv.config()
connectDB()

const app = express()

// ── Middleware ──────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-vercel-app.vercel.app'
]

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

// ── Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/account', accountRoutes)
app.use('/api/reviews/:productId', reviewRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.get('/api/health', (req, res) => res.json({ status: 'OK ✅' }))

// ── Error Handlers ──────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
