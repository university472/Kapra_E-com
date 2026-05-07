import { Link } from 'react-router-dom'
import { Store, Phone, Mail, MapPin } from 'lucide-react'
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '../../constants'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-gray-700">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Store className="text-brand-400" size={22} />
              <span className="font-display font-bold text-xl text-white">
                Kapra Store
              </span>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Premium unstitched fabric — lawn, khaddar, cotton & more.
              Nationwide COD delivery from Sadiqabad to all of Pakistan.
            </p>

            {/* ✅ FIXED WhatsApp Button */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366]
                         text-white text-sm font-medium px-4 py-2
                         rounded-xl hover:bg-[#1dbb57] transition-colors"
            >
              <Phone size={14} />
              WhatsApp Us
            </a>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['All Fabrics', '/products'],
                ['Lawn Suits', '/category/women-lawn'],
                ['Khaddar', '/category/women-khaddar'],
                ['Cotton', '/category/cotton-unstitched'],
                ['New Arrivals', '/products?sort=createdAt_desc'],
                ['Sale', '/products?sort=price_asc']
              ].map(([label, to]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="hover:text-brand-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Account</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['My Orders', '/account/orders'],
                ['Wishlist', '/account/wishlist'],
                ['My Addresses', '/account/addresses'],
                ['Track Order', '/track-order']
              ].map(([label, to]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="hover:text-brand-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Help</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ['FAQ', '/faq'],
                ['Shipping & Returns', '/shipping-returns'],
                ['About Us', '/about'],
                ['Contact Us', '/contact']
              ].map(([label, to]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="hover:text-brand-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact */}
            <div className="mt-5 space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin size={12} />
                Sadiqabad, Rahim Yar Khan, Punjab
              </div>
              <div className="flex items-center gap-2">
                <Mail size={12} />
                hello@kaprastore.com
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Kapra Store. All rights reserved.</p>

          <div className="flex items-center gap-1 flex-wrap justify-center">
            {['COD', 'JazzCash', 'Easypaisa', 'Bank Transfer'].map((item) => (
              <span
                key={item}
                className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
