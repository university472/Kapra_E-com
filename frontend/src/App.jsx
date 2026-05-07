import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { Toaster } from 'sonner'
import { HelmetProvider } from 'react-helmet-async'
import { useAuthStore } from './stores/authStore'
import { useCartStore } from './stores/cartStore'
import { useWishlistStore } from './stores/wishlistStore'
import RouteProgress from './components/shared/RouteProgress'

// Layout
import MainLayout from './components/layout/MainLayout'
import AdminLayout from './components/layout/AdminLayout'
import ProtectedRoute from './components/shared/ProtectedRoute'
import AdminRoute from './components/shared/AdminRoute'
import PageLoader from './components/shared/PageLoader'

// ── Lazy-loaded Pages ─────────────────────────────────────
// Public
const Home = lazy(() => import('./pages/public/Home'))
const About = lazy(() => import('./pages/public/About'))
const Contact = lazy(() => import('./pages/public/Contact'))

// Shop
const Products = lazy(() => import('./pages/shop/Products'))
const ProductDetail = lazy(() => import('./pages/shop/ProductDetail'))
const Category = lazy(() => import('./pages/shop/Category'))
const SearchResults = lazy(() => import('./pages/shop/SearchResults.jsx'))

// Cart & Checkout
const Cart = lazy(() => import('./pages/cart/Cart'))
const Checkout = lazy(() => import('./pages/cart/Checkout'))
const OrderConfirmation = lazy(() => import('./pages/cart/OrderConfirmation'))

// Auth
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register.jsx'))
const VerifyOTP = lazy(() => import('./pages/auth/VerifyOTP'))

// Account
const AccountDashboard = lazy(() => import('./pages/account/Dashboard'))
const MyOrders = lazy(() => import('./pages/account/MyOrders'))
const OrderDetail = lazy(() => import('./pages/account/OrderDetail'))
const Wishlist = lazy(() => import('./pages/account/Wishlist'))
const Addresses = lazy(() => import('./pages/account/Addresses'))

// Support
const TrackOrder = lazy(() => import('./pages/support/TrackOrder'))
const FAQ = lazy(() => import('./pages/support/FAQ'))
const ShippingReturns = lazy(() => import('./pages/support/ShippingReturns'))

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons')) // Already present

// 404
const NotFound = lazy(() => import('./pages/public/NotFound'))

export default function App() {
  const { user, isAuthenticated } = useAuthStore()
  const { fetchCart } = useCartStore()
  const { fetchIds } = useWishlistStore()

  // Sync cart & wishlist on mount / login
  useEffect(() => {
    fetchCart()
    if (isAuthenticated()) fetchIds()
  }, [user])

  return (
    <HelmetProvider>
      <BrowserRouter>
        {/* ── ADDED: RouteProgress as first child ── */}
        <RouteProgress />

        <Toaster
          position="top-center"
          richColors
          toastOptions={{ duration: 2500 }}
        />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Main Public Layout ───────────────────── */}
            <Route element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />

              {/* Shop */}
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="category/:slug" element={<Category />} />
              <Route path="search" element={<SearchResults />} />

              {/* Cart */}
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route
                path="order-confirmation/:orderId"
                element={<OrderConfirmation />}
              />

              {/* Auth */}
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="verify-otp" element={<VerifyOTP />} />

              {/* Account — Protected */}
              <Route path="account" element={<ProtectedRoute />}>
                <Route index element={<AccountDashboard />} />
                <Route path="orders" element={<MyOrders />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="addresses" element={<Addresses />} />
              </Route>

              {/* Support */}
              <Route path="track-order" element={<TrackOrder />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="shipping-returns" element={<ShippingReturns />} />
            </Route>

            {/* ── Admin Layout ─────────────────────────── */}
            <Route path="admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                {/* ── ADDED: Admin Coupons route ── */}
                <Route path="coupons" element={<AdminCoupons />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  )
}
