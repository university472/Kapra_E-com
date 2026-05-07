import { Truck, Banknote, RefreshCcw, MessageCircle } from 'lucide-react'
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '../../constants'

const badges = [
  {
    icon: Truck,
    title: 'Nationwide Delivery',
    sub: '3-7 Business Days',
    color: 'text-blue-600 bg-blue-50'
  },
  {
    icon: Banknote,
    title: 'Cash on Delivery',
    sub: 'Pay when you receive',
    color: 'text-green-600 bg-green-50'
  },
  {
    icon: RefreshCcw,
    title: '7-Day Returns',
    sub: 'Easy & Hassle-free',
    color: 'text-amber-600 bg-amber-50'
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Support',
    sub: 'Reply within 1 hour',
    color: 'text-emerald-600 bg-emerald-50',
    href: `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`
  }
]

export default function TrustBadges({ className = '' }) {
  return (
    <section
      className={`grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 ${className}`}
    >
      {badges.map(({ icon: Icon, title, sub, color, href }) => {
        const Wrapper = href ? 'a' : 'div'
        return (
          <Wrapper
            key={title}
            {...(href
              ? { href, target: '_blank', rel: 'noopener noreferrer' }
              : {})}
            className="flex flex-col items-center text-center
                       bg-white rounded-2xl p-4 shadow-sm
                       border border-gray-100 gap-3
                       hover:shadow-md transition-shadow
                       cursor-default"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center
                             justify-center ${color}`}
            >
              <Icon size={22} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 leading-tight">
                {title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
            </div>
          </Wrapper>
        )
      })}
    </section>
  )
}
