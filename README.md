# 🧵 Kapra Store — Premium Unstitched Fabric E-Commerce Platform


**A full-stack, mobile-first e-commerce platform built for the Pakistani fabric market.**  
Cash on Delivery · JWT Auth · Admin Dashboard · Cloudinary Images · Email OTP · PWA Ready

[Live Demo](#) · [Report Bug](https://github.com/yourusername/kapra-ecom/issues) · [Request Feature](https://github.com/yourusername/kapra-ecom/issues)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Admin Setup](#-admin-setup)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🏪 About the Project

**Kapra Store** is a production-grade B2C e-commerce platform specializing in premium unstitched fabric — lawn, khaddar, cotton, chiffon, silk, and more. Built specifically for the Pakistani market with:

- 🇵🇰 **Nationwide COD delivery** as the primary payment method
- 📱 **Mobile-first design** (90%+ of Pakistani traffic is mobile)
- 🌐 **Bilingual support** — English UI with Urdu-friendly content
- 🔐 **Email OTP verification** for secure account creation
- 🛒 **Guest checkout** — no account required to order
- 👨‍💼 **Full admin panel** — manage products, orders, users, and coupons

> Built as an MVP for small-to-medium fabric businesses in Sadiqabad, Rahim Yar Khan, and nationwide.

---

## ✨ Features

### 🛍️ Customer Features

| Feature | Description |
|---|---|
| **Product Catalog** | Browse 6 fabric types with pagination |
| **Smart Filters** | Filter by price, GSM, yardage, fabric type, color, occasion |
| **Search** | Autocomplete search with real-time suggestions |
| **Quick View** | View product details without leaving the catalog page |
| **Product Detail** | Image gallery with zoom, fabric specs table, color swatches |
| **Shopping Cart** | Persistent cart for guests and logged-in users |
| **Guest Checkout** | Order without creating an account (COD) |
| **User Checkout** | Saved addresses, order history, faster checkout |
| **Coupon Codes** | Apply discount codes at checkout |
| **Order Tracking** | Track any order with Order ID + phone number |
| **Wishlist** | Save favourite products |
| **Reviews & Ratings** | Verified purchase reviews with photo upload |
| **Account Dashboard** | Orders, wishlist, addresses, invoice download |
| **Restock Alerts** | Get notified via email when sold-out items return |
| **PWA** | Install as a mobile app, works offline |

### 🛠️ Admin Features

| Feature | Description |
|---|---|
| **Dashboard** | Revenue charts, KPIs, top products, low stock alerts |
| **Product Management** | Full CRUD with multi-image Cloudinary upload |
| **Order Management** | View all orders, update status, add tracking number |
| **Return Requests** | Approve or reject customer return requests |
| **User Management** | View customers, total spend, promote to admin |
| **Coupon System** | Create percentage/fixed coupons with expiry & usage limits |
| **PDF Invoices** | Auto-generated invoice for every order |
| **Email Notifications** | Order confirmation + status updates via Nodemailer |

### 🎨 UX & Design

- Clean **pastel + earthy** brand palette (cream, blush pink, dusty teal, warm gold)
- **Poppins** body font + **Playfair Display** headings
- Sticky mobile bottom navigation (5 tabs)
- Desktop mega-menu with category navigation
- Shimmer skeleton loaders on all data-fetching pages
- NProgress route loading bar
- WhatsApp floating button on all pages
- Social proof — viewers count, stock urgency, recent purchase toast
- Rotating announcement bar with countdown timer
- Newsletter popup with 10% discount offer

---

## 🧰 Tech Stack

### Frontend
```
React 18          — UI framework
Vite              — Build tool & dev server
Tailwind CSS 3    — Utility-first styling
Shadcn UI         — Accessible component library
Zustand           — State management (cart, auth, wishlist)
React Router v6   — Client-side routing
Axios             — HTTP client with JWT interceptors
React Hook Form   — Form handling
Zod               — Schema validation
Lucide React      — Icon library
Sonner            — Toast notifications
React Helmet      — SEO meta tags
NProgress         — Route loading bar
```

### Backend
```
Node.js 20        — Runtime
Express.js 4      — REST API framework
MongoDB Atlas     — Cloud database (free M0 tier)
Mongoose          — ODM / schema modeling
JWT               — Access + refresh token auth
Bcryptjs          — Password hashing
Nodemailer        — Email (OTP + order notifications)
Cloudinary        — Image upload & CDN
Multer            — Multipart form handling
PDFKit            — Invoice PDF generation
Express-Validator — Input validation
Nanoid            — Unique order ID generation
Slugify           — URL-friendly slugs
```

### Infrastructure
```
Frontend  → Vercel (free)
Backend   → Railway or Render (free tier)
Database  → MongoDB Atlas (free M0 cluster)
Images    → Cloudinary (free tier)
Email     → Gmail SMTP (free)
```

---

## 📁 Project Structure

```
kapra-ecom/
│
├── backend/                        # Express.js REST API
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js               # MongoDB connection
│   │   │   └── cloudinary.js       # Cloudinary + multer config
│   │   │
│   │   ├── models/
│   │   │   ├── User.js             # User schema (role: user|admin)
│   │   │   ├── Product.js          # Product schema (fabric specs)
│   │   │   ├── Category.js         # Category tree schema
│   │   │   ├── Cart.js             # Cart (guest + user)
│   │   │   ├── Wishlist.js         # Wishlist schema
│   │   │   ├── Order.js            # Order schema (COD + tracking)
│   │   │   ├── Address.js          # Saved addresses
│   │   │   ├── Review.js           # Product reviews + ratings
│   │   │   ├── Coupon.js           # Discount coupon schema
│   │   │   ├── Newsletter.js       # Newsletter subscribers
│   │   │   └── RestockAlert.js     # Restock notification alerts
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── category.controller.js
│   │   │   ├── cart.controller.js
│   │   │   ├── wishlist.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── review.controller.js
│   │   │   ├── coupon.controller.js
│   │   │   ├── account.controller.js
│   │   │   └── admin.controller.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── category.routes.js
│   │   │   ├── cart.routes.js
│   │   │   ├── wishlist.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── review.routes.js
│   │   │   ├── coupon.routes.js
│   │   │   ├── account.routes.js
│   │   │   ├── search.routes.js
│   │   │   └── admin.routes.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # protect + adminOnly + optionalAuth
│   │   │   ├── errorHandler.js      # Global error handler
│   │   │   └── validateRequest.js   # express-validator middleware
│   │   │
│   │   ├── utils/
│   │   │   ├── asyncHandler.js
│   │   │   ├── generateOTP.js
│   │   │   ├── generateTokens.js
│   │   │   ├── sendEmail.js
│   │   │   ├── orderEmail.js
│   │   │   └── generateInvoice.js
│   │   │
│   │   └── seed/
│   │       └── seed.js              # 20 sample products + admin user
│   │
│   ├── server.js                    # App entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/                        # React + Vite SPA
    ├── public/
    │   ├── manifest.json            # PWA manifest
    │   └── sw.js                    # Service worker
    │
    ├── src/
    │   ├── api/
    │   │   ├── axios.js             # Axios instance + JWT interceptors
    │   │   ├── index.js             # All API functions
    │   │   └── cartMerge.js         # Guest-to-user cart merge
    │   │
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.jsx       # Desktop + mobile nav
    │   │   │   ├── Footer.jsx
    │   │   │   ├── MobileBottomNav.jsx
    │   │   │   ├── MainLayout.jsx
    │   │   │   ├── AdminLayout.jsx
    │   │   │   └── AnnouncementBar.jsx
    │   │   │
    │   │   ├── ui/
    │   │   │   ├── ProductCard.jsx
    │   │   │   ├── SkeletonCard.jsx
    │   │   │   ├── TrustBadges.jsx
    │   │   │   ├── WhatsAppButton.jsx
    │   │   │   ├── Pagination.jsx
    │   │   │   ├── StarRating.jsx
    │   │   │   ├── ReviewSection.jsx
    │   │   │   ├── CouponInput.jsx
    │   │   │   ├── QuickViewModal.jsx
    │   │   │   ├── RecentlyViewed.jsx
    │   │   │   ├── SocialProof.jsx
    │   │   │   ├── RestockAlert.jsx
    │   │   │   ├── NewsletterPopup.jsx
    │   │   │   └── PWAInstallBanner.jsx
    │   │   │
    │   │   └── shared/
    │   │       ├── ProtectedRoute.jsx
    │   │       ├── AdminRoute.jsx
    │   │       ├── PageLoader.jsx
    │   │       ├── PageMeta.jsx
    │   │       └── RouteProgress.jsx
    │   │
    │   ├── pages/
    │   │   ├── public/      Home · About · Contact · NotFound
    │   │   ├── shop/        Products · ProductDetail · Category · SearchResults
    │   │   ├── cart/        Cart · Checkout · OrderConfirmation
    │   │   ├── auth/        Login · Register · VerifyOTP
    │   │   ├── account/     Dashboard · MyOrders · OrderDetail · Wishlist · Addresses
    │   │   ├── support/     TrackOrder · FAQ · ShippingReturns
    │   │   └── admin/       AdminDashboard · AdminProducts · AdminOrders · AdminUsers · AdminCoupons
    │   │
    │   ├── stores/
    │   │   ├── authStore.js
    │   │   ├── cartStore.js
    │   │   ├── wishlistStore.js
    │   │   └── recentlyViewedStore.js
    │   │
    │   ├── hooks/
    │   │   ├── useDebounce.js
    │   │   ├── useProducts.js
    │   │   └── usePWA.js
    │   │
    │   ├── constants/index.js
    │   ├── lib/utils.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    │
    ├── vercel.json
    ├── tailwind.config.js
    └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

```bash
node --version    # v18 or higher
npm --version     # v9 or higher
```

You will also need free accounts on:
- [MongoDB Atlas](https://cloud.mongodb.com) — database
- [Cloudinary](https://cloudinary.com) — image hosting
- [Gmail](https://mail.google.com) — SMTP for sending emails (enable 2FA + App Password)

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/kapra-ecom.git
cd kapra-ecom
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Fill in your .env values (see Environment Variables section below)
nano .env
```

**Start the backend dev server:**

```bash
npm run dev
# ✅ MongoDB Connected
# 🚀 Server running on port 5000
```

**Seed the database** (20 sample products + admin user):

```bash
node src/seed/seed.js
# ✅ Seeded 20 products
# ✅ Admin created: admin@kapra.store / Admin@1234
```

---

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Set your backend URL
# VITE_API_URL=http://localhost:5000/api
```

**Install Shadcn UI components:**

```bash
npx shadcn@latest init
# Choose: Default style · Stone color · CSS variables: yes

npx shadcn@latest add button input label badge card dialog drawer \
  dropdown-menu select slider separator skeleton sheet avatar tabs \
  scroll-area progress
```

**Start the frontend dev server:**

```bash
npm run dev
# ➜ Local: http://localhost:5173/
```

---

### 4. Open in Browser

| URL | Description |
|---|---|
| `http://localhost:5173` | Customer storefront |
| `http://localhost:5173/admin` | Admin dashboard |
| `http://localhost:5000/api/health` | Backend health check |

---

## 🔐 Environment Variables

### Backend — `backend/.env`

```env
# ── Server ───────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ── MongoDB ──────────────────────────────────────────────
# Get this from MongoDB Atlas → Connect → Drivers
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/kapra-ecom

# ── JWT ──────────────────────────────────────────────────
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=your_64_char_random_string_here
JWT_REFRESH_SECRET=another_64_char_random_string_here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# ── Email (Gmail SMTP) ───────────────────────────────────
# Gmail: Settings → Security → 2-Step Verification → App Passwords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your_16_char_app_password
EMAIL_FROM="Kapra Store <yourgmail@gmail.com>"

# ── Cloudinary ───────────────────────────────────────────
# Get from: cloudinary.com → Dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Frontend URL (for CORS) ──────────────────────────────
CLIENT_URL=http://localhost:5173
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

> **Production:** Change `VITE_API_URL` to your deployed backend URL

---

## 👨‍💼 Admin Setup

### Default Admin Credentials

After running the seed script, use these credentials to log in:

```
Email:    admin@kapra.store
Password: Admin@1234
```

> ⚠️ **Important:** Change this password immediately after first login in production.

### How to Log In as Admin

1. Go to `http://localhost:5173/login`
2. Enter the admin email and password above
3. You will be automatically redirected to `/admin/dashboard`

### How to Add a Product

1. Log in as admin → navigate to `/admin/products`
2. Click **"Add Product"** button (top right)
3. Fill in the form:

| Field | Required | Description |
|---|---|---|
| Product Name | ✅ | e.g. "Gul Ahmed Summer Lawn 3-Piece" |
| Price (PKR) | ✅ | Original price |
| Sale Price | ❌ | Optional discounted price |
| Category | ✅ | Select from dropdown |
| Fabric Type | ✅ | Lawn, Khaddar, Cotton, etc. |
| Stock | ✅ | Number of units available |
| GSM Weight | ❌ | Fabric weight in GSM |
| Yardage | ❌ | 2.5m / 3m / 3.5m |
| Colors | ❌ | Comma-separated: "White, Pink, Blue" |
| Description | ❌ | Detailed product description |
| Images | ❌ | Upload up to 8 images |
| ✨ Featured | ❌ | Check to show in "Featured Picks" on homepage |
| Active | ✅ | Must be checked for product to be visible |

4. Click **"Create Product"**
5. Product instantly appears on the storefront — no refresh needed

### How Products Appear on Homepage

```
Admin checks "Featured" checkbox
        ↓
Product saved to MongoDB with isFeatured: true
        ↓
Homepage calls GET /api/products?featured=true
        ↓
"Featured Picks" section displays the product

Additionally:
Homepage calls GET /api/products?sort=createdAt_desc
        ↓
"New Arrivals" section shows ALL new products automatically
```

### Admin Route Protection

All `/admin/*` routes are protected by two layers:

1. **`protect` middleware** — verifies JWT token is valid
2. **`adminOnly` middleware** — checks `role === "admin"` in the token

Non-admin users who try to access `/admin` are redirected to `/` automatically.

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication
```
GET  /api/auth/me                → Get current user (requires Bearer token)
POST /api/auth/register          → Register + send OTP
POST /api/auth/verify-otp        → Verify OTP + issue JWT
POST /api/auth/login             → Login
POST /api/auth/logout            → Logout
POST /api/auth/refresh           → Refresh access token
POST /api/auth/resend-otp        → Resend OTP email
```

### Products
```
GET  /api/products               → List products (filter/sort/paginate)
GET  /api/products/:id           → Single product
GET  /api/products/slug/:slug    → Product by slug
GET  /api/products/filters/meta  → Filter metadata (colors, yardages, etc.)
POST /api/products               → Create product [Admin]
PUT  /api/products/:id           → Update product [Admin]
DEL  /api/products/:id           → Soft-delete product [Admin]
```

### Query Parameters for GET /api/products
```
?page=1           Pagination page
?limit=12         Items per page
?fabricType=lawn  Filter by fabric type (comma-separated for multiple)
?minPrice=500     Minimum price
?maxPrice=5000    Maximum price
?category=<id>    Filter by category ID
?yardage=3        Filter by yardage
?occasion=eid     Filter by occasion
?color=White      Filter by color
?sort=price_asc   Sort: createdAt_desc|price_asc|price_desc|name_asc
?featured=true    Only featured products
```

### Orders
```
POST  /api/orders                → Place order (guest or user)
GET   /api/orders/track          → Track by orderId + phone (public)
GET   /api/orders/my             → My orders [Auth]
GET   /api/orders/:id            → Order detail [Auth]
PATCH /api/orders/:id/cancel     → Cancel order [Auth]
POST  /api/orders/:id/return     → Request return [Auth]
GET   /api/orders/:id/invoice    → Download PDF invoice [Auth]
```

### Admin
```
GET   /api/admin/dashboard            → KPIs + charts [Admin]
GET   /api/admin/orders               → All orders [Admin]
PATCH /api/admin/orders/:id/status    → Update order status [Admin]
PATCH /api/admin/orders/:id/return    → Approve/reject return [Admin]
GET   /api/admin/products             → Products with stock filter [Admin]
GET   /api/admin/users                → All customers [Admin]
PATCH /api/admin/users/:id/role       → Promote to admin [Admin]
```

### Other Routes
```
GET  /api/categories             → Category tree
GET  /api/search?q=lawn          → Search (autocomplete + full results)
GET  /api/cart                   → Get cart
POST /api/cart/add               → Add item to cart
POST /api/coupons/validate       → Validate coupon code
GET  /api/wishlist               → Get wishlist [Auth]
POST /api/wishlist/toggle/:id    → Toggle wishlist item [Auth]
GET  /api/reviews/:productId     → Get product reviews
POST /api/reviews/:productId     → Create review [Auth]
```

---

## 🌐 Deployment

### Deploy Backend → Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Select your repo → set **Root Directory** to `/backend`
4. Add all environment variables from your `.env` file
5. Railway auto-detects Node.js and runs `npm start`
6. Copy your deployed URL (e.g. `https://kapra-backend.up.railway.app`)

### Deploy Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
2. Set **Root Directory** to `frontend`
3. Set **Build Command** to `npm run build`
4. Set **Output Directory** to `dist`
5. Add environment variable:
   ```
   VITE_API_URL = https://your-railway-backend.up.railway.app/api
   ```
6. Deploy — Vercel handles the rest

### Update Backend CORS

In your backend `.env` on Railway, update:
```env
CLIENT_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

---

## 📱 PWA (Progressive Web App)

This app is PWA-ready. Customers on mobile can install it directly to their home screen:

1. Visit the site on Chrome (Android) or Safari (iOS)
2. A banner appears: **"Install Kapra Store"**
3. Tap **Install** → the app appears on the home screen
4. Works offline for previously visited pages

---

## 📊 Database Schemas

| Model | Purpose |
|---|---|
| `User` | Customers and admins with JWT refresh tokens |
| `Product` | Fabric products with specs (GSM, yardage, fabricType) |
| `Category` | Hierarchical categories with parent-child support |
| `Cart` | Session-based (guest) + user-linked carts |
| `Order` | Full order lifecycle with guest support and COD |
| `Address` | Saved delivery addresses per user |
| `Review` | Verified purchase reviews with ratings distribution |
| `Coupon` | Percentage/fixed discount codes with usage tracking |
| `Wishlist` | User wishlists |
| `Newsletter` | Email subscribers |
| `RestockAlert` | Out-of-stock notification requests |

---

## 🗺️ Sitemap

```
PUBLIC
  /                     Homepage
  /about                About Us
  /contact              Contact + WhatsApp CTA

SHOP
  /products             All products (filters + sort + pagination)
  /products/:id         Product detail
  /category/:slug       Category page
  /search?q=            Search results

CART & CHECKOUT
  /cart                 Shopping cart
  /checkout             Checkout (guest + user)
  /order-confirmation   Order success page

AUTH
  /login                Login
  /register             Register
  /verify-otp           Email OTP verification

ACCOUNT (Protected)
  /account              Dashboard
  /account/orders       Order history
  /account/orders/:id   Order detail + cancel/return
  /account/wishlist     Saved products
  /account/addresses    Saved addresses

SUPPORT
  /track-order          Guest order tracking
  /faq                  FAQ
  /shipping-returns     Policies

ADMIN (Admin only)
  /admin                Dashboard + KPIs
  /admin/products       Product CRUD
  /admin/orders         Order management
  /admin/users          Customer management
  /admin/coupons        Coupon management
```

---

## 🖼️ Screenshots

| Page | Preview |
|---|---|
| Homepage | Hero slider · categories · featured products · trust badges |
| Products | Grid/list view · filter sidebar · sort · active filter tags |
| Product Detail | Image zoom · fabric specs · reviews · sticky CTA |
| Cart | Free shipping bar · qty controls · order summary |
| Checkout | Progress bar · COD default · coupon input |
| Admin Dashboard | KPI cards · revenue chart · order status · low stock |
| Admin Products | Table with image · edit/delete · toggle visibility |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

### Coding Standards

- Use ES Modules (`import/export`) throughout
- Follow existing file naming conventions
- Add `asyncHandler` wrapper to all Express route handlers
- Validate all inputs with `express-validator` (backend) or `zod` (frontend)
- Keep components under 300 lines — split if larger

---

## 🐛 Known Issues & Roadmap

### Planned Features (Phase 2)

- [ ] JazzCash / Easypaisa payment gateway integration
- [ ] SMS notifications via Twilio or local SMS gateway
- [ ] AI-based product recommendations
- [ ] Bulk product import via CSV
- [ ] Advanced analytics dashboard with date range picker
- [ ] Multi-language (full Urdu translation)
- [ ] Product comparison feature
- [ ] Seller portal (multi-vendor)

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

```
MIT License — Copyright (c) 2025 Kapra Store

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software, to deal in the Software without restriction, including the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software.
```

---

## 📞 Contact & Support

**Project Owner:** Your Name  
**Email:** hello@kaprastore.com  
**WhatsApp:** 03XX-XXXXXXX  
**Location:** Sadiqabad, Rahim Yar Khan, Punjab, Pakistan

**GitHub:** [github.com/yourusername/kapra-ecom](https://github.com/yourusername/kapra-ecom)

---

<div align="center">

**Built with ❤️ for Pakistani fabric businesses**

⭐ **Star this repo** if it helped you!

[![GitHub stars](https://img.shields.io/github/stars/yourusername/kapra-ecom?style=social)](https://github.com/yourusername/kapra-ecom/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/kapra-ecom?style=social)](https://github.com/yourusername/kapra-ecom/network/members)

</div>