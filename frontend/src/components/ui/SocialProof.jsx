import { useEffect, useState } from 'react'
import { Eye, ShoppingBag, Zap, TrendingUp } from 'lucide-react'

// Simulated real-time social proof (replace with actual WebSocket/SSE in production)
export function ViewersCount({ productId }) {
  const [viewers, setViewers] = useState(0)

  useEffect(() => {
    // Seed with a deterministic number based on productId
    const base = (parseInt(productId.slice(-4), 16) % 12) + 3
    setViewers(base)

    // Fluctuate naturally
    const interval = setInterval(() => {
      setViewers((v) => {
        const change = Math.random() > 0.5 ? 1 : -1
        return Math.max(2, Math.min(25, v + change))
      })
    }, 8000)
    return () => clearInterval(interval)
  }, [productId])

  if (viewers < 3) return null

  return (
    <div
      className="flex items-center gap-2 bg-orange-50 border
                    border-orange-200 rounded-xl px-3 py-2.5"
    >
      <div className="flex -space-x-1">
        {[...Array(Math.min(viewers, 4))].map((_, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full border border-white
                       animate-pulse"
            style={{
              backgroundColor: ['#f97316', '#ec4899', '#3b82f6', '#10b981'][i],
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </div>
      <p className="text-xs font-semibold text-orange-800">
        <span className="text-orange-600 font-bold">{viewers} people</span>{' '}
        viewing this right now
      </p>
    </div>
  )
}

export function SoldCount({ count = 0, period = 'today' }) {
  if (count < 1) return null
  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className="w-6 h-6 bg-green-100 rounded-lg flex items-center
                      justify-center"
      >
        <TrendingUp size={13} className="text-green-600" />
      </div>
      <p className="text-gray-600">
        <span className="font-bold text-gray-800">{count} sold</span> in the
        last 24 hours
      </p>
    </div>
  )
}

export function StockUrgency({ stock }) {
  if (stock > 10 || stock === 0) return null

  return (
    <div
      className="flex items-center gap-2 bg-red-50 border
                    border-red-200 rounded-xl px-3 py-2.5"
    >
      <Zap size={14} className="text-red-500 shrink-0" />
      <p className="text-xs font-bold text-red-700">
        Only {stock} left — selling fast!
      </p>
      <div className="ml-auto flex gap-0.5">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-3 rounded-sm
                        ${i < stock ? 'bg-red-400' : 'bg-red-100'}`}
          />
        ))}
      </div>
    </div>
  )
}

// Floating "just purchased" notification
export function RecentPurchaseToast() {
  const [notification, setNotification] = useState(null)

  const NAMES = ['Fatima K.', 'Sana A.', 'Ayesha M.', 'Zara B.', 'Maryam N.']
  const CITIES = [
    'Karachi',
    'Lahore',
    'Islamabad',
    'Faisalabad',
    'Multan',
    'Peshawar'
  ]
  const FABRICS = ['Lawn Suit', 'Khaddar', 'Cotton Dupatta', 'Chiffon Suit']
  const TIMES = ['2 min', '5 min', '8 min', '12 min', '15 min']

  useEffect(() => {
    const show = () => {
      setNotification({
        name: NAMES[Math.floor(Math.random() * NAMES.length)],
        city: CITIES[Math.floor(Math.random() * CITIES.length)],
        item: FABRICS[Math.floor(Math.random() * FABRICS.length)],
        time: TIMES[Math.floor(Math.random() * TIMES.length)]
      })
      setTimeout(() => setNotification(null), 4500)
    }

    // Show after 8s, then every 25-35s
    const initial = setTimeout(show, 8000)
    const interval = setInterval(show, 25000 + Math.random() * 10000)
    return () => {
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [])

  if (!notification) return null

  return (
    <div
      className="fixed bottom-24 left-4 sm:bottom-6 sm:left-6 z-50
                    bg-white rounded-2xl shadow-xl border border-gray-100
                    px-4 py-3 flex items-center gap-3 max-w-xs
                    animate-in slide-in-from-left-4 duration-400"
    >
      <div
        className="w-10 h-10 bg-brand-50 rounded-xl flex items-center
                      justify-center shrink-0"
      >
        <ShoppingBag size={18} className="text-brand-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-gray-800">
          {notification.name} from {notification.city}
        </p>
        <p className="text-xs text-gray-500 truncate">
          Just bought {notification.item}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {notification.time} ago
        </p>
      </div>
      <div
        className="w-2 h-2 bg-green-500 rounded-full shrink-0
                      animate-pulse"
      />
    </div>
  )
}
