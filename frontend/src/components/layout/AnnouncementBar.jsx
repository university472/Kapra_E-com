import { useState, useEffect } from 'react'
import { X, ChevronLeft } from 'lucide-react'

const ANNOUNCEMENTS = [
  {
    id: 1,
    text: '🚀 Free Shipping on orders above Rs. 2,999',
    link: '/products',
    cta: 'Shop Now'
  },
  {
    id: 2,
    text: '⏰ Eid Sale — Up to 20% off all lawn suits',
    link: '/category/women-lawn',
    cta: 'Shop Eid',
    countdown: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 3,
    text: '💸 Cash on Delivery available across Pakistan',
    link: '/faq',
    cta: 'Learn More'
  }
]

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!targetDate) return

    const update = () => {
      const diff = targetDate - Date.now()
      if (diff <= 0) {
        setTimeLeft('00:00:00:00')
        return
      }

      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)

      setTimeLeft(
        `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
      )
    }

    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [targetDate])

  return timeLeft
}

export default function AnnouncementBar() {
  const [current, setCurrent] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const announcement = ANNOUNCEMENTS[current]
  const countdown = useCountdown(announcement.countdown)

  // Auto-cycle
  useEffect(() => {
    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % ANNOUNCEMENTS.length)
    }, 5000)

    return () => clearInterval(t)
  }, [])

  if (dismissed) return null

  return (
    <div className="bg-brand-600 text-white text-xs sm:text-sm py-2.5 px-4 relative flex items-center justify-center gap-3">
      {/* Prev */}
      <button
        onClick={() =>
          setCurrent(
            (c) => (c - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length
          )
        }
        className="absolute left-3 sm:left-6 p-0.5 hover:bg-white/20 rounded transition-colors hidden sm:block"
      >
        <ChevronLeft size={14} />
      </button>

      {/* Content */}
      <div className="flex items-center gap-3 text-center">
        <span className="font-medium">{announcement.text}</span>

        {/* Countdown */}
        {announcement.countdown && countdown && (
          <span className="bg-white/20 px-2 py-0.5 rounded-full font-mono font-bold text-xs shrink-0">
            ⏱ {countdown}
          </span>
        )}

        {/* ✅ FIXED CTA BUTTON */}
        {announcement.cta && (
          <a
            href={announcement.link}
            className="shrink-0 bg-white text-brand-700 text-[11px] font-bold px-2.5 py-1 rounded-full hover:bg-brand-50 transition-colors"
          >
            {announcement.cta} →
          </a>
        )}
      </div>

      {/* Dots */}
      <div className="absolute right-10 flex gap-1 hidden sm:flex">
        {ANNOUNCEMENTS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i === current ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Close */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 sm:right-4 p-0.5 hover:bg-white/20 rounded transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}
