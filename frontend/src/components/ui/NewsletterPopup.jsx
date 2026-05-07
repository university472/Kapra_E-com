import { useState, useEffect } from 'react'
import { X, Mail, Gift } from 'lucide-react'
import api from '../../api/axios'
import { toast } from 'sonner'

export default function NewsletterPopup() {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Show popup after 20s if not subscribed and not dismissed recently
    const dismissed = localStorage.getItem('newsletter-dismissed')
    const subscribed = localStorage.getItem('newsletter-subscribed')

    if (subscribed || dismissed) return

    const timer = setTimeout(() => setShow(true), 20000)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem('newsletter-dismissed', Date.now().toString())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await api.post('/newsletter/subscribe', { email, source: 'popup' })
      setDone(true)
      localStorage.setItem('newsletter-subscribed', 'true')
      setTimeout(() => setShow(false), 3000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not subscribe')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm
                 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={handleDismiss}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full
                   overflow-hidden animate-in slide-in-from-bottom-8
                   duration-500 sm:slide-in-from-bottom-0
                   sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative header */}
        <div
          className="bg-gradient-to-br from-brand-500 to-brand-700
                        p-8 text-center relative"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-7 h-7 bg-white/20
                       rounded-full flex items-center justify-center
                       hover:bg-white/40 transition-colors"
          >
            <X size={14} className="text-white" />
          </button>
          <div
            className="w-16 h-16 bg-white/20 rounded-2xl flex items-center
                          justify-center mx-auto mb-4"
          >
            <Gift size={32} className="text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-1">
            Get 10% Off!
          </h2>
          <p className="text-brand-100 text-sm">
            Subscribe to our newsletter and get an exclusive discount on your
            first order
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          {done ? (
            <div className="text-center py-4">
              <p className="text-4xl mb-3">🎉</p>
              <p className="font-bold text-gray-900 text-lg">
                You're subscribed!
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Check your email for your discount code
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2
                                 text-gray-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200
                             rounded-xl text-sm focus:outline-none
                             focus:ring-2 focus:ring-brand-300"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-500 text-white py-3.5
                           rounded-xl font-bold text-sm
                           hover:bg-brand-600 transition-colors
                           disabled:opacity-50"
              >
                {loading ? 'Subscribing…' : 'Get My 10% Discount →'}
              </button>
              <p className="text-xs text-gray-400 text-center">
                No spam, unsubscribe anytime. We hate spam too 🙅
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
