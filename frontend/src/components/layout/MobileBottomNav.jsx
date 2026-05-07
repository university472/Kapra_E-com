import { NavLink } from 'react-router-dom'
import { Home, Grid2x2, ShoppingCart, Heart, User } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import { useAuthStore } from '../../stores/authStore'

const navItems = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/products', label: 'Shop', icon: Grid2x2 },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account', label: 'Account', icon: User }
]

export default function MobileBottomNav() {
  const { itemCount } = useCartStore()
  const { ids: wishIds } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white
                    border-t border-gray-200 sm:hidden
                    grid grid-cols-5 safe-area-inset-bottom shadow-lg"
    >
      {navItems.map(({ to, label, icon: Icon, exact }) => {
        // Redirect auth-required pages to login
        const href =
          (to === '/account/wishlist' || to === '/account') &&
          !isAuthenticated()
            ? '/login'
            : to

        return (
          <NavLink
            key={to}
            to={href}
            end={exact}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 gap-0.5
               relative transition-colors
               ${isActive ? 'text-brand-600' : 'text-gray-400'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={isActive ? 'text-brand-600' : 'text-gray-400'}
                  />

                  {/* Cart badge */}
                  {to === '/cart' && itemCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5
                                     bg-brand-500 text-white text-[9px]
                                     rounded-full w-4 h-4 flex items-center
                                     justify-center font-bold"
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}

                  {/* Wishlist badge */}
                  {to === '/account/wishlist' && wishIds.length > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5
                                     bg-red-500 text-white text-[9px]
                                     rounded-full w-4 h-4 flex items-center
                                     justify-center font-bold"
                    >
                      {wishIds.length > 9 ? '9+' : wishIds.length}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium
                                  ${isActive ? 'text-brand-600' : 'text-gray-400'}`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
