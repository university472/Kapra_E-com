// src/components/ui/RestockAlert.jsx
import { useState } from 'react'
import { Bell, Mail, Check } from 'lucide-react'
import api from '../../api/axios'
import { toast } from 'sonner'

export default function RestockAlert({ productId }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const { data } = await api.post(`/products/${productId}/restock-alert`, {
        email
      })
      toast.success(data.message)
      setSubscribed(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not subscribe')
    } finally {
      setLoading(false)
    }
  }

  if (subscribed) {
    return (
      <div
        className="flex items-center gap-2 bg-green-50 border
                      border-green-200 rounded-xl px-4 py-3"
      >
        <Check size={16} className="text-green-600" />
        <p className="text-sm font-semibold text-green-800">
          We'll notify you when it's back in stock!
        </p>
      </div>
    )
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2
                   border-2 border-gray-300 text-gray-700 py-3.5
                   rounded-xl font-semibold text-sm
                   hover:border-brand-400 hover:text-brand-600
                   transition-colors"
      >
        <Bell size={16} />
        Notify Me When Back in Stock
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Mail
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2
                         text-gray-400"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full pl-9 pr-4 py-3 border border-gray-200
                     rounded-xl text-sm focus:outline-none focus:ring-2
                     focus:ring-brand-300 bg-gray-50"
          required
          autoFocus
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-5 py-3 bg-gray-800 text-white rounded-xl
                   text-sm font-bold hover:bg-gray-900 transition-colors
                   disabled:opacity-50 flex items-center gap-1.5"
      >
        <Bell size={14} />
        {loading ? '…' : 'Notify'}
      </button>
    </form>
  )
}
