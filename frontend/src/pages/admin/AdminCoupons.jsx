import { useState, useEffect } from 'react'
import { Plus, Tag, Edit2, Trash2, Copy, X, Check } from 'lucide-react'
import { adminAPI } from '../../api'
import api from '../../api/axios'
import PageMeta from '../../components/shared/PageMeta'
import { toast } from 'sonner'

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const emptyForm = {
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    maxUses: '',
    expiresAt: '',
    onePerUser: true,
    isActive: true
  }
  const [form, setForm] = useState(emptyForm)

  const fetchCoupons = () => {
    setLoading(true)
    api
      .get('/coupons')
      .then(({ data }) => setCoupons(data.coupons))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleSave = async () => {
    if (!form.code || !form.value || !form.type) {
      toast.error('Code, type, and value are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null
      }

      if (editing) {
        await api.put(`/coupons/${editing}`, payload)
        toast.success('Coupon updated')
      } else {
        await api.post('/coupons', payload)
        toast.success('Coupon created')
      }
      setShowForm(false)
      setEditing(null)
      setForm(emptyForm)
      fetchCoupons()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied!')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return
    try {
      await api.delete(`/coupons/${id}`)
      setCoupons((c) => c.filter((x) => x._id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Failed')
    }
  }

  return (
    <>
      <PageMeta title="Admin — Coupons" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Coupons
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {coupons.length} active coupons
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setForm(emptyForm)
            setShowForm(true)
          }}
          className="flex items-center gap-2 bg-brand-500 text-white
                     px-5 py-2.5 rounded-xl font-bold text-sm
                     hover:bg-brand-600 transition-colors"
        >
          <Plus size={18} />
          Create Coupon
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div
          className="bg-white rounded-2xl border border-brand-200
                        shadow-md p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">
              {editing ? 'Edit Coupon' : 'New Coupon'}
            </h2>
            <button onClick={() => setShowForm(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              {
                key: 'code',
                label: 'Coupon Code *',
                placeholder: 'SAVE10',
                upper: true
              },
              {
                key: 'description',
                label: 'Description',
                placeholder: '10% off everything'
              },
              {
                key: 'value',
                label: 'Discount Value *',
                type: 'number',
                placeholder: '10'
              },
              {
                key: 'minOrderAmount',
                label: 'Min Order (PKR)',
                type: 'number',
                placeholder: '0'
              },
              {
                key: 'maxDiscount',
                label: 'Max Discount (PKR)',
                type: 'number',
                placeholder: 'Leave empty'
              },
              {
                key: 'maxUses',
                label: 'Max Uses',
                type: 'number',
                placeholder: 'Leave empty = unlimited'
              },
              { key: 'expiresAt', label: 'Expires At', type: 'date' }
            ].map(({ key, label, type = 'text', placeholder, upper }) => (
              <div key={key}>
                <label
                  className="block text-xs font-semibold text-gray-600
                                   mb-1.5 uppercase tracking-wide"
                >
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [key]: upper
                        ? e.target.value.toUpperCase()
                        : e.target.value
                    })
                  }
                  placeholder={placeholder}
                  className="w-full px-3 py-2.5 border border-gray-200
                             rounded-xl text-sm bg-gray-50 focus:bg-white
                             focus:outline-none focus:ring-2
                             focus:ring-brand-300 font-mono"
                />
              </div>
            ))}

            <div>
              <label
                className="block text-xs font-semibold text-gray-600
                                 mb-1.5 uppercase tracking-wide"
              >
                Type *
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200
                           rounded-xl text-sm bg-gray-50 focus:bg-white
                           focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Rs.)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-5 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.onePerUser}
                onChange={(e) =>
                  setForm({ ...form, onePerUser: e.target.checked })
                }
                className="w-4 h-4 rounded text-brand-500"
              />
              <span className="text-sm text-gray-700">
                One use per customer
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded text-brand-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-brand-500 text-white
                         px-6 py-2.5 rounded-xl font-bold text-sm
                         hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {saving ? '…' : <Check size={15} />}
              {saving ? 'Saving…' : editing ? 'Update' : 'Create Coupon'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 border border-gray-200 rounded-xl
                         text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Coupons grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 shimmer rounded-2xl" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div
          className="text-center py-20 bg-white rounded-2xl
                        border border-gray-100"
        >
          <Tag size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500">No coupons yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => {
            const isExpired =
              coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
            const isFull = coupon.maxUses && coupon.usedCount >= coupon.maxUses

            return (
              <div
                key={coupon._id}
                className={`bg-white rounded-2xl border shadow-sm p-5
                            relative overflow-hidden
                            ${
                              !coupon.isActive || isExpired || isFull
                                ? 'opacity-60 border-gray-200'
                                : 'border-brand-200'
                            }`}
              >
                {/* Background decoration */}
                <div
                  className="absolute right-0 top-0 w-24 h-24
                                bg-brand-50 rounded-full -translate-x-8
                                -translate-y-8 opacity-50"
                />

                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono font-bold text-lg
                                         text-brand-700 tracking-widest"
                        >
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          className="p-1 hover:bg-brand-50 rounded-lg
                                     transition-colors"
                        >
                          <Copy size={13} className="text-brand-400" />
                        </button>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {coupon.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full
                                      ${
                                        !coupon.isActive || isExpired || isFull
                                          ? 'bg-gray-100 text-gray-500'
                                          : 'bg-green-100 text-green-700'
                                      }`}
                    >
                      {isExpired
                        ? 'Expired'
                        : isFull
                          ? 'Exhausted'
                          : coupon.isActive
                            ? 'Active'
                            : 'Inactive'}
                    </span>
                  </div>

                  {/* Value */}
                  <div className="text-3xl font-display font-bold text-brand-600 mb-3">
                    {coupon.type === 'percentage'
                      ? `${coupon.value}% OFF`
                      : `Rs. ${coupon.value} OFF`}
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-xs text-gray-500">
                    {coupon.minOrderAmount > 0 && (
                      <p>
                        Min order: Rs. {coupon.minOrderAmount.toLocaleString()}
                      </p>
                    )}
                    {coupon.maxUses && (
                      <p>
                        Uses: {coupon.usedCount}/{coupon.maxUses}
                      </p>
                    )}
                    {coupon.expiresAt && (
                      <p>
                        Expires:{' '}
                        {new Date(coupon.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Usage bar */}
                  {coupon.maxUses && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-brand-500 h-1.5 rounded-full"
                          style={{
                            width: `${(coupon.usedCount / coupon.maxUses) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setEditing(coupon._id)
                        setForm({
                          code: coupon.code,
                          description: coupon.description || '',
                          type: coupon.type,
                          value: coupon.value,
                          minOrderAmount: coupon.minOrderAmount || '',
                          maxDiscount: coupon.maxDiscount || '',
                          maxUses: coupon.maxUses || '',
                          expiresAt: coupon.expiresAt
                            ? new Date(coupon.expiresAt)
                                .toISOString()
                                .split('T')[0]
                            : '',
                          onePerUser: coupon.onePerUser,
                          isActive: coupon.isActive
                        })
                        setShowForm(true)
                      }}
                      className="flex-1 flex items-center justify-center
                                 gap-1 py-1.5 border border-gray-200
                                 rounded-xl text-xs text-gray-600
                                 hover:border-brand-300 hover:text-brand-600
                                 transition-colors"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="flex-1 flex items-center justify-center
                                 gap-1 py-1.5 border border-red-100
                                 rounded-xl text-xs text-red-500
                                 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
