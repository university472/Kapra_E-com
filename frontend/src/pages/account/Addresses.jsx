import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Home,
  Briefcase,
  MoreHorizontal,
  Check
} from 'lucide-react'
import api from '../../api/axios'
import PageMeta from '../../components/shared/PageMeta'
import { PROVINCES } from '../../constants'
import { toast } from 'sonner'

const schema = z.object({
  label: z.enum(['Home', 'Work', 'Other']),
  fullName: z.string().min(2, 'Full name required'),
  phone: z.string().regex(/^0[0-9]{10}$/, 'Valid phone required'),
  street: z.string().min(5, 'Street address required'),
  city: z.string().min(2, 'City required'),
  district: z.string().optional(),
  province: z.string().optional()
})

const LABEL_ICONS = {
  Home: Home,
  Work: Briefcase,
  Other: MoreHorizontal
}

export default function Addresses() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { label: 'Home' }
  })

  const fetchAddresses = () => {
    api
      .get('/account/addresses')
      .then(({ data }) => setAddresses(data.addresses || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  const openAdd = () => {
    setEditing(null)
    reset({ label: 'Home' })
    setShowForm(true)
  }

  const openEdit = (addr) => {
    setEditing(addr._id)
    reset(addr)
    setShowForm(true)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/account/addresses/${editing}`, data)
        toast.success('Address updated')
      } else {
        await api.post('/account/addresses', data)
        toast.success('Address added')
      }
      setShowForm(false)
      fetchAddresses()
    } catch {
      toast.error('Could not save address')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return
    try {
      await api.delete(`/account/addresses/${id}`)
      setAddresses((a) => a.filter((addr) => addr._id !== id))
      toast.success('Address removed')
    } catch {
      toast.error('Could not delete address')
    }
  }

  const handleSetDefault = async (id) => {
    try {
      await api.patch(`/account/addresses/${id}/default`)
      fetchAddresses()
      toast.success('Default address updated')
    } catch {
      toast.error('Could not update default')
    }
  }

  return (
    <>
      <PageMeta title="My Addresses" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MapPin className="text-brand-500" size={24} />
            <h1 className="font-display text-2xl font-bold text-gray-900">
              Saved Addresses
            </h1>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-brand-500 text-white
                       px-4 py-2.5 rounded-xl text-sm font-bold
                       hover:bg-brand-600 transition-colors"
          >
            <Plus size={16} />
            Add New
          </button>
        </div>

        {/* Address form */}
        {showForm && (
          <div
            className="bg-white rounded-3xl border border-brand-200
                          shadow-md p-6 mb-5"
          >
            <h2 className="font-bold text-gray-900 mb-4">
              {editing ? 'Edit Address' : 'New Address'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Label */}
              <div>
                <label
                  className="block text-sm font-semibold
                                   text-gray-700 mb-2"
                >
                  Address Type
                </label>
                <div className="flex gap-3">
                  {['Home', 'Work', 'Other'].map((l) => {
                    const Icon = LABEL_ICONS[l]
                    return (
                      <label key={l} className="flex-1 cursor-pointer">
                        <input
                          {...register('label')}
                          type="radio"
                          value={l}
                          className="sr-only peer"
                        />
                        <div
                          className="flex items-center justify-center
                                        gap-2 py-2.5 rounded-xl border-2
                                        border-gray-200 text-gray-600
                                        peer-checked:border-brand-500
                                        peer-checked:bg-brand-50
                                        peer-checked:text-brand-700
                                        transition-all cursor-pointer
                                        text-sm font-medium"
                        >
                          <Icon size={15} />
                          {l}
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    name: 'fullName',
                    label: 'Full Name *',
                    placeholder: 'Recipient name'
                  },
                  {
                    name: 'phone',
                    label: 'Phone *',
                    placeholder: '03001234567',
                    type: 'tel'
                  },
                  {
                    name: 'street',
                    label: 'Street Address *',
                    placeholder: 'House, Street, Area',
                    className: 'sm:col-span-2'
                  },
                  {
                    name: 'city',
                    label: 'City *',
                    placeholder: 'Rahim Yar Khan'
                  },
                  {
                    name: 'district',
                    label: 'District',
                    placeholder: 'Sadiqabad'
                  }
                ].map(
                  ({
                    name,
                    label,
                    placeholder,
                    type = 'text',
                    className = ''
                  }) => (
                    <div key={name} className={className}>
                      <label
                        className="block text-sm font-semibold
                                       text-gray-700 mb-1.5"
                      >
                        {label}
                      </label>
                      <input
                        {...register(name)}
                        type={type}
                        placeholder={placeholder}
                        className={`w-full px-4 py-3 rounded-xl border text-sm
                                  bg-gray-50 focus:bg-white focus:outline-none
                                  focus:ring-2 focus:ring-brand-300 transition-all
                                  ${
                                    errors[name]
                                      ? 'border-red-300'
                                      : 'border-gray-200'
                                  }`}
                      />
                      {errors[name] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[name].message}
                        </p>
                      )}
                    </div>
                  )
                )}

                <div className="sm:col-span-2">
                  <label
                    className="block text-sm font-semibold
                                     text-gray-700 mb-1.5"
                  >
                    Province
                  </label>
                  <select
                    {...register('province')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200
                               text-sm bg-gray-50 focus:bg-white focus:outline-none
                               focus:ring-2 focus:ring-brand-300 transition-all"
                  >
                    <option value="">Select Province</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-brand-500 text-white py-3
                             rounded-xl font-bold text-sm
                             hover:bg-brand-600 transition-colors
                             disabled:opacity-50"
                >
                  {saving ? 'Saving…' : editing ? 'Update' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-3 rounded-xl border border-gray-200
                             text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 shimmer rounded-2xl" />
            ))}
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <div
            className="text-center py-20 bg-white rounded-3xl
                          border border-gray-100"
          >
            <MapPin size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 text-sm mb-4">No saved addresses yet</p>
            <button
              onClick={openAdd}
              className="bg-brand-500 text-white px-6 py-2.5
                         rounded-full text-sm font-bold
                         hover:bg-brand-600 transition-colors"
            >
              + Add Your First Address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => {
              const Icon = LABEL_ICONS[addr.label] || MapPin
              return (
                <div
                  key={addr._id}
                  className={`bg-white rounded-2xl border-2 shadow-sm p-5
                              transition-all
                              ${
                                addr.isDefault
                                  ? 'border-brand-400'
                                  : 'border-gray-100'
                              }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 bg-brand-50 rounded-xl
                                      flex items-center justify-center shrink-0"
                      >
                        <Icon size={18} className="text-brand-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-sm text-gray-800">
                            {addr.label}
                          </p>
                          {addr.isDefault && (
                            <span
                              className="bg-brand-100 text-brand-700
                                             text-[10px] font-bold px-2 py-0.5
                                             rounded-full flex items-center gap-1"
                            >
                              <Check size={9} />
                              Default
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-sm text-gray-700">
                          {addr.fullName}
                        </p>
                        <p
                          className="text-xs text-gray-500 mt-0.5
                                      leading-relaxed"
                        >
                          {addr.street}, {addr.city}
                          {addr.province ? `, ${addr.province}` : ''}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {addr.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr._id)}
                          className="text-xs text-brand-600 font-semibold
                                     px-2.5 py-1.5 rounded-lg
                                     hover:bg-brand-50 transition-colors"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(addr)}
                        className="p-1.5 text-gray-400 hover:text-brand-500
                                   hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(addr._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500
                                   hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div className="h-20 sm:h-0" />
    </>
  )
}
