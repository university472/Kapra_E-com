// src/pages/support/FAQ.jsx
import PageMeta from '../../components/shared/PageMeta'
const FAQS = [
  {
    q: 'How long does delivery take?',
    a: '3-7 business days nationwide. Karachi, Lahore, Islamabad — 2-3 days.'
  },
  {
    q: 'Is Cash on Delivery available?',
    a: 'Yes! COD is available on all orders across Pakistan.'
  },
  {
    q: 'What is your return policy?',
    a: '7-day returns from date of delivery. Item must be unused and in original condition.'
  },
  {
    q: 'How do I track my order?',
    a: 'Go to Track Order page, enter your Order ID and phone number.'
  },
  {
    q: 'Can I change or cancel my order?',
    a: 'Yes, only if the order is still in Pending status. Go to My Orders to cancel.'
  },
  {
    q: 'What fabrics do you sell?',
    a: 'Lawn, Khaddar, Cotton, Chiffon, Silk, Organza, and Linen — all unstitched.'
  },
  {
    q: 'Do you ship to all of Pakistan?',
    a: 'Yes! We ship to all cities and towns via TCS and Leopard Courier.'
  }
]

export default function FAQ() {
  return (
    <>
      <PageMeta title="FAQ" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">
          Frequently Asked Questions
        </h1>
        <div className="space-y-4">
          {FAQS.map(({ q, a }) => (
            <div
              key={q}
              className="bg-white rounded-2xl border border-gray-100
                            shadow-sm p-5"
            >
              <h3 className="font-bold text-gray-900 text-sm mb-2">{q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
