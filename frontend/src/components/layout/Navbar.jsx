import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  Store,
  LogOut
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import { categoryAPI, searchAPI } from '../../api'
import { useDebounce } from '../../hooks/useDebounce'
import { toast } from 'sonner'

export default function Navbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, isAuthenticated, logout, isAdmin } = useAuthStore()
  const { itemCount } = useCartStore()
  const { ids: wishIds } = useWishlistStore()

  const [categories, setCategories] = useState([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggest, setShowSuggest] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)
  const searchRef = useRef(null)

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false)
  }, [pathname])

  // Fetch categories for mega-menu
  useEffect(() => {
    categoryAPI
      .getAll()
      .then(({ data }) => setCategories(data))
      .catch(() => {})
  }, [])

  // Autocomplete
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([])
      return
    }
    searchAPI
      .autocomplete(debouncedSearch)
      .then(({ data }) => {
        setSuggestions(data.suggestions ?? [])
        setShowSuggest(true)
      })
      .catch(() => {})
  }, [debouncedSearch])

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggest(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setShowSuggest(false)
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      {/* ── Top Banner ─────────────────────────────────── */}
      <div
        className="bg-brand-500 text-white text-center py-1.5
                      text-xs font-medium tracking-wide hidden sm:block"
      >
        🚚 Free Delivery on orders above Rs. 2,999 &nbsp;|&nbsp; 💸 Cash on
        Delivery Available Nationwide
      </div>

      {/* ── Main Navbar ────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Store className="text-brand-500" size={26} />
            <span
              className="font-display font-bold text-xl text-brand-700
                             hidden sm:block leading-none"
            >
              Kapra Store
            </span>
          </Link>

          {/* Search Bar (desktop) */}
          <div
            ref={searchRef}
            className="flex-1 max-w-xl hidden md:block relative"
          >
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggest(true)}
                  placeholder="Search fabric, lawn, khaddar..."
                  className="w-full pl-4 pr-12 py-2.5 border border-gray-200
                             rounded-full text-sm bg-gray-50 focus:bg-white
                             focus:outline-none focus:ring-2 focus:ring-brand-300
                             transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-brand-500"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Autocomplete Dropdown */}
            {showSuggest && suggestions.length > 0 && (
              <div
                className="absolute top-full mt-1 left-0 right-0
                              bg-white border border-gray-200 rounded-xl
                              shadow-lg z-50 overflow-hidden"
              >
                {suggestions.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => {
                      setShowSuggest(false)
                      setSearchQuery('')
                      navigate(`/products/${product._id}`)
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5
                               hover:bg-gray-50 text-left transition-colors"
                  >
                    <img
                      src={product.images?.[0] || '/placeholder.png'}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover border"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-brand-500 font-semibold">
                        Rs.{' '}
                        {(product.salePrice || product.price)?.toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
                <Link
                  to={`/search?q=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setShowSuggest(false)}
                  className="block text-center text-xs text-brand-600
                             font-semibold py-2.5 border-t hover:bg-gray-50"
                >
                  See all results for "{searchQuery}"
                </Link>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Wishlist (hidden on mobile — in bottom nav) */}
            <Link
              to={isAuthenticated() ? '/account/wishlist' : '/login'}
              className="relative p-2 text-gray-600 hover:text-brand-500
                         transition-colors hidden sm:flex"
              aria-label="Wishlist"
            >
              <Heart size={22} />
              {wishIds.length > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5
                                 bg-red-500 text-white text-[10px]
                                 rounded-full w-4 h-4 flex items-center
                                 justify-center font-bold"
                >
                  {wishIds.length > 9 ? '9+' : wishIds.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-brand-500
                         transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5
                                 bg-brand-500 text-white text-[10px]
                                 rounded-full w-4 h-4 flex items-center
                                 justify-center font-bold"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated() ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5
                             text-sm font-medium text-gray-700
                             hover:text-brand-600 transition-colors"
                >
                  <User size={18} />
                  <span className="hidden lg:block max-w-[80px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-1 w-48 bg-white
                                  border border-gray-200 rounded-xl
                                  shadow-lg z-50 overflow-hidden py-1"
                  >
                    <Link
                      to="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700
                                 hover:bg-gray-50 font-medium"
                    >
                      My Account
                    </Link>
                    <Link
                      to="/account/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700
                                 hover:bg-gray-50"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/account/wishlist"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700
                                 hover:bg-gray-50"
                    >
                      Wishlist
                    </Link>
                    {isAdmin() && (
                      <>
                        <div className="border-t border-gray-100 my-1" />
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm
                                     text-brand-600 hover:bg-gray-50 font-medium"
                        >
                          Admin Panel
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5
                                 text-sm text-red-500 hover:bg-red-50"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1.5 px-4 py-1.5
                           bg-brand-500 text-white text-sm font-medium
                           rounded-full hover:bg-brand-600 transition-colors"
              >
                <User size={15} />
                Login
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-gray-600 sm:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Desktop Category Nav ───────────────────── */}
        <nav
          className="hidden md:flex items-center gap-6 pb-3 pt-1
                        text-sm font-medium text-gray-600 overflow-x-auto
                        scrollbar-hide"
        >
          <Link
            to="/products"
            className="hover:text-brand-600 transition-colors whitespace-nowrap"
          >
            All Fabrics
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className="hover:text-brand-600 transition-colors whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            to="/products?featured=true"
            className="text-brand-500 font-semibold
                           hover:text-brand-700 transition-colors whitespace-nowrap"
          >
            ✨ Featured
          </Link>
        </nav>
      </div>

      {/* ── Mobile Menu ───────────────────────────────── */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white shadow-lg">
          {/* Mobile Search */}
          <form
            onSubmit={handleSearch}
            className="px-4 py-3 border-b border-gray-100"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fabric..."
                className="w-full pl-4 pr-10 py-2.5 border border-gray-200
                           rounded-full text-sm bg-gray-50 focus:outline-none
                           focus:ring-2 focus:ring-brand-300"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2
                                 text-gray-400"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Mobile Nav Links */}
          <nav className="px-4 py-3 space-y-1">
            {[
              { to: '/products', label: 'All Fabrics' },
              ...categories.map((c) => ({
                to: `/category/${c.slug}`,
                label: c.name
              })),
              { to: '/track-order', label: 'Track Order' },
              { to: '/faq', label: 'FAQ' }
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="block px-3 py-2.5 text-sm text-gray-700
                           hover:bg-gray-50 rounded-lg font-medium"
              >
                {label}
              </Link>
            ))}

            {isAuthenticated() ? (
              <>
                <div className="border-t border-gray-100 my-2" />
                <Link
                  to="/account"
                  className="block px-3 py-2.5 text-sm text-gray-700
                                 hover:bg-gray-50 rounded-lg"
                >
                  My Account
                </Link>
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2.5 text-sm text-brand-600
                                   hover:bg-gray-50 rounded-lg font-semibold"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2.5
                             text-sm text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link
                  to="/login"
                  className="flex-1 text-center py-2.5 bg-brand-500
                                 text-white text-sm font-medium rounded-full"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex-1 text-center py-2.5 border
                                 border-brand-500 text-brand-500 text-sm
                                 font-medium rounded-full"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
