import { useState } from 'react'
import { Tag, Check, X, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import api from '../../api/axios'
import { formatPrice } from '../../lib/utils'
import { toast } from 'sonner'

export default function CouponInput({
  subtotal,
  onApply,
  appliedCoupon,
  onRemove
}) {
  const { user } = useAuthStore()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleApply = async () => {
    if (!code.trim()) return
    setLoading(true)
    try {
      const { data } = await api.post('/coupons/validate', {
        code: code.trim(),
        subtotal,
        userId: user?._id
      })
      onApply(data)
      toast.success(data.message)
      setCode('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon')
    } finally {
      setLoading(false)
    }
  }

  if (appliedCoupon) {
    return (
      <div
        className="flex items-center justify-between bg-green-50
                      border border-green-200 rounded-xl px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 bg-green-100 rounded-lg flex items-center
                          justify-center"
          >
            <Tag size={14} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-green-800">
              {appliedCoupon.code}
            </p>
            <p className="text-xs text-green-600">
              -{formatPrice(appliedCoupon.discount)} saved!
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
        >
          <X size={15} className="text-green-700" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2
                        text-gray-400"
        />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="Enter coupon code"
          className="w-full pl-9 pr-4 py-3 border border-gray-200
                     rounded-xl text-sm bg-gray-50 focus:bg-white
                     focus:outline-none focus:ring-2 focus:ring-brand-300
                     transition-all font-mono tracking-wider uppercase"
        />
      </div>
      <button
        onClick={handleApply}
        disabled={loading || !code.trim()}
        className="px-5 py-3 bg-brand-500 text-white rounded-xl
                   text-sm font-bold hover:bg-brand-600 transition-colors
                   disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Check size={15} />
        )}
        Apply
      </button>
    </div>
  )
}
