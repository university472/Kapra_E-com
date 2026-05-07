import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center
                    px-4 bg-cream"
    >
      <div className="text-center max-w-md">
        <p className="text-8xl font-display font-bold text-brand-200 mb-4">
          404
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          The page you're looking for doesn't exist. Let's get you back to
          shopping!
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 bg-brand-500 text-white
                           px-6 py-3 rounded-full font-bold hover:bg-brand-600
                           transition-colors"
          >
            <Home size={16} />
            Go Home
          </Link>
          <Link
            to="/products"
            className="flex items-center gap-2 border border-gray-200
                           text-gray-700 px-6 py-3 rounded-full font-semibold
                           hover:border-brand-300 hover:text-brand-600
                           transition-colors"
          >
            <Search size={16} />
            Browse Fabrics
          </Link>
        </div>
      </div>
    </div>
  )
}
