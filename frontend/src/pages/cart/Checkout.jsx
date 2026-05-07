import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MapPin,
  Phone,
  User,
  ChevronDown,
  ChevronRight,
  Banknote,
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Edit2,
  Plus
} from 'lucide-react'
import { orderAPI } from '../../api'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import PageMeta from '../../components/shared/PageMeta'
import { formatPrice } from '../../lib/utils'
import { PROVINCES } from '../../constants'
import { toast } from 'sonner'
import CouponInput from '../../components/ui/CouponInput' // ← ADDED

// ── Zod schemas ──────────────────────────────────────────
const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  phone: z.string().regex(/^0[0-9]{10}$/, 'Enter valid phone (03XXXXXXXXX)'),
  street: z.string().min(5, 'Street address required'),
  city: z.string().min(2, 'City required'),
  district: z.string().optional(),
  province: z.string().optional()
})

const guestSchema = addressSchema.extend({
  guestName: z.string().min(2, 'Your name is required'),
  guestEmail: z
    .string()
    .email('Valid email required')
    .optional()
    .or(z.literal('')),
  guestPhone: z
    .string()
    .regex(/^0[0-9]{10}$/, 'Enter valid phone (03XXXXXXXXX)')
})

// ── Progress Steps ────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Cart' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Confirm' }
]

const PAYMENT_METHODS = [
  {
    id: 'COD',
    label: 'Cash on Delivery',
    subLabel: 'Pay when you receive',
    icon: Banknote,
    color: 'text-green-600',
    badge: 'Most Popular',
    badgeColor: 'bg-green-100 text-green-700'
  },
  {
    id: 'JazzCash',
    label: 'JazzCash',
    subLabel: 'Mobile wallet payment',
    icon: CreditCard,
    color: 'text-red-500',
    badge: 'Coming Soon',
    badgeColor: 'bg-gray-100 text-gray-500',
    disabled: true
  },
  {
    id: 'Easypaisa',
    label: 'Easypaisa',
    subLabel: 'Mobile wallet payment',
    icon: CreditCard,
    color: 'text-green-500',
    badge: 'Coming Soon',
    badgeColor: 'bg-gray-100 text-gray-500',
    disabled: true
  }
]

export default function Checkout() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { items, subtotal, shippingFee, total, itemCount, fetchCart } =
    useCartStore()

  const [step, setStep] = useState(2) // Start at Details
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [loading, setLoading] = useState(false)
  const [checkoutMode, setCheckoutMode] = useState(
    isAuthenticated() ? 'user' : 'guest'
  )
  const [notes, setNotes] = useState('')
  const [coupon, setCoupon] = useState(null) // ← ADDED
  const discountedTotal = total - (coupon?.discount || 0) // ← ADDED

  useEffect(() => {
    fetchCart()
  }, [])

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && items.length === 0) {
      navigate('/cart')
    }
  }, [items])

  const schema = checkoutMode === 'guest' ? guestSchema : addressSchema

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const payload = {
        useCart: true,
        paymentMethod,
        notes: notes || undefined,
        shippingAddress: {
          fullName: data.fullName || data.guestName,
          phone: data.phone || data.guestPhone,
          street: data.street,
          city: data.city,
          district: data.district || undefined,
          province: data.province || undefined
        },
        couponCode: coupon?.code || undefined // ← ADDED
      }

      if (checkoutMode === 'guest') {
        payload.guestInfo = {
          name: data.guestName,
          email: data.guestEmail || undefined,
          phone: data.guestPhone
        }
      }

      const { data: res } = await orderAPI.place(payload)
      toast.success('Order placed successfully! 🎉')
      navigate(`/order-confirmation/${res.orderId}`, {
        state: {
          orderId: res.orderId,
          total: res.total,
          paymentMethod: res.paymentMethod
        }
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) return null

  return (
    <>
      <PageMeta title="Checkout" />
      <div className="min-h-screen bg-cream">
        {/* ── Header ──────────────────────────────────── */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between py-4">
              <Link
                to="/"
                className="font-display font-bold text-lg text-brand-700"
              >
                Kapra Store
              </Link>
              <Link
                to="/cart"
                className="text-sm text-gray-500 hover:text-brand-600"
              >
                ← Back to cart
              </Link>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-0 pb-4">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center
                                    justify-center text-xs font-bold
                                    transition-colors
                                    ${
                                      s.id < step
                                        ? 'bg-brand-500 text-white'
                                        : s.id === step
                                          ? 'bg-brand-500 text-white ring-4 ring-brand-100'
                                          : 'bg-gray-200 text-gray-400'
                                    }`}
                    >
                      {s.id < step ? <CheckCircle2 size={16} /> : s.id}
                    </div>
                    <span
                      className={`text-xs font-semibold hidden sm:block
                                      ${
                                        s.id <= step
                                          ? 'text-gray-800'
                                          : 'text-gray-400'
                                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-3 rounded
                                    ${
                                      s.id < step
                                        ? 'bg-brand-500'
                                        : 'bg-gray-200'
                                    }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* ── Left column ─────────────────────── */}
              <div className="flex-1 space-y-5">
                {/* Guest vs Login toggle (shown only when not logged in) */}
                {!isAuthenticated() && (
                  <div
                    className="bg-white rounded-2xl border border-gray-100
                                  shadow-sm p-5"
                  >
                    <h2 className="font-bold text-gray-900 mb-4">
                      How would you like to checkout?
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCheckoutMode('guest')}
                        className={`p-4 rounded-xl border-2 text-left
                                    transition-colors
                                    ${
                                      checkoutMode === 'guest'
                                        ? 'border-brand-500 bg-brand-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                      >
                        <p className="font-semibold text-sm text-gray-800">
                          Guest Checkout
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          No account needed
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          navigate('/login', {
                            state: { from: '/checkout' }
                          })
                        }
                        className="p-4 rounded-xl border-2 border-gray-200
                                   hover:border-brand-300 text-left
                                   transition-colors"
                      >
                        <p className="font-semibold text-sm text-gray-800">
                          Login & Checkout
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Save address & track orders
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Guest contact info */}
                {checkoutMode === 'guest' && (
                  <Section title="Your Contact Details" icon={User}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="Your Name *"
                        error={errors.guestName?.message}
                      >
                        <input
                          {...register('guestName')}
                          placeholder="Aisha Khan"
                          className={iCls(errors.guestName)}
                        />
                      </Field>
                      <Field
                        label="Phone Number *"
                        error={errors.guestPhone?.message}
                      >
                        <input
                          {...register('guestPhone')}
                          type="tel"
                          placeholder="03001234567"
                          className={iCls(errors.guestPhone)}
                        />
                      </Field>
                      <Field
                        label={
                          <span>
                            Email{' '}
                            <span className="text-gray-400 font-normal">
                              (for receipt, optional)
                            </span>
                          </span>
                        }
                        error={errors.guestEmail?.message}
                        className="sm:col-span-2"
                      >
                        <input
                          {...register('guestEmail')}
                          type="email"
                          placeholder="you@example.com"
                          className={iCls(errors.guestEmail)}
                        />
                      </Field>
                    </div>
                  </Section>
                )}

                {/* Logged-in welcome */}
                {isAuthenticated() && (
                  <div
                    className="bg-green-50 border border-green-200
                                  rounded-2xl px-5 py-4 flex items-center gap-3"
                  >
                    <CheckCircle2
                      className="text-green-600 shrink-0"
                      size={20}
                    />
                    <div>
                      <p className="text-sm font-semibold text-green-800">
                        Logged in as {user.name}
                      </p>
                      <p className="text-xs text-green-600">{user.email}</p>
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                <Section title="Shipping Address" icon={MapPin}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {checkoutMode === 'user' && (
                      <>
                        <Field
                          label="Full Name *"
                          error={errors.fullName?.message}
                        >
                          <input
                            {...register('fullName')}
                            placeholder="Recipient's full name"
                            defaultValue={user?.name}
                            className={iCls(errors.fullName)}
                          />
                        </Field>
                        <Field label="Phone *" error={errors.phone?.message}>
                          <input
                            {...register('phone')}
                            type="tel"
                            placeholder="03001234567"
                            defaultValue={user?.phone}
                            className={iCls(errors.phone)}
                          />
                        </Field>
                      </>
                    )}

                    <Field
                      label="Street Address *"
                      error={errors.street?.message}
                      className="sm:col-span-2"
                    >
                      <input
                        {...register('street')}
                        placeholder="House #, Street, Block, Area"
                        className={iCls(errors.street)}
                      />
                    </Field>

                    <Field label="City *" error={errors.city?.message}>
                      <input
                        {...register('city')}
                        placeholder="Rahim Yar Khan"
                        className={iCls(errors.city)}
                      />
                    </Field>

                    <Field label="District" error={errors.district?.message}>
                      <input
                        {...register('district')}
                        placeholder="e.g. Sadiqabad"
                        className={iCls(errors.district)}
                      />
                    </Field>

                    <Field
                      label="Province"
                      error={errors.province?.message}
                      className="sm:col-span-2"
                    >
                      <select
                        {...register('province')}
                        className={`${iCls(errors.province)}
                                    appearance-none cursor-pointer`}
                      >
                        <option value="">Select Province</option>
                        {PROVINCES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </Section>

                {/* Payment Method */}
                <Section title="Payment Method" icon={Banknote}>
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((pm) => (
                      <label
                        key={pm.id}
                        className={`flex items-center gap-4 p-4 rounded-xl
                                    border-2 cursor-pointer transition-all
                                    ${
                                      pm.disabled
                                        ? 'opacity-50 cursor-not-allowed bg-gray-50'
                                        : paymentMethod === pm.id
                                          ? 'border-brand-500 bg-brand-50'
                                          : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={pm.id}
                          checked={paymentMethod === pm.id}
                          onChange={() =>
                            !pm.disabled && setPaymentMethod(pm.id)
                          }
                          disabled={pm.disabled}
                          className="w-4 h-4 text-brand-500 cursor-pointer"
                        />
                        <pm.icon size={22} className={pm.color} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-gray-800">
                              {pm.label}
                            </p>
                            <span
                              className={`text-[10px] font-bold px-2
                                             py-0.5 rounded-full ${pm.badgeColor}`}
                            >
                              {pm.badge}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {pm.subLabel}
                          </p>
                        </div>
                        {paymentMethod === pm.id && (
                          <CheckCircle2
                            size={18}
                            className="text-brand-500 shrink-0"
                          />
                        )}
                      </label>
                    ))}
                  </div>
                </Section>

                {/* Order Notes */}
                <Section title="Order Notes" icon={Edit2}>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special instructions, delivery time preference, etc. (optional)"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200
                               text-sm bg-gray-50 focus:bg-white focus:outline-none
                               focus:ring-2 focus:ring-brand-300 transition-all
                               resize-none"
                  />
                </Section>
              </div>

              {/* ── Right column — Order Summary ─────── */}
              <div className="lg:w-80 shrink-0">
                <div
                  className="bg-white rounded-2xl border border-gray-100
                                shadow-sm p-6 sticky top-28"
                >
                  <h2
                    className="font-display font-bold text-lg
                                 text-gray-900 mb-5"
                  >
                    Order Summary
                  </h2>

                  {/* Items */}
                  <div
                    className="space-y-3 max-h-52
                                  overflow-y-auto scrollbar-hide"
                  >
                    {items.map((item) => {
                      const p = item.product
                      if (!p) return null
                      return (
                        <div key={p._id} className="flex gap-3 items-start">
                          <div className="relative shrink-0">
                            <img
                              src={p.images?.[0] || '/placeholder.png'}
                              alt={p.name}
                              className="w-12 h-14 object-cover
                                         rounded-lg border border-gray-100"
                            />
                            <span
                              className="absolute -top-1.5 -right-1.5
                                             bg-brand-500 text-white text-[9px]
                                             w-4 h-4 rounded-full flex items-center
                                             justify-center font-bold"
                            >
                              {item.qty}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-xs font-medium text-gray-700
                                          line-clamp-2"
                            >
                              {p.name}
                            </p>
                            <p className="text-xs font-bold text-brand-600 mt-0.5">
                              {formatPrice((p.salePrice ?? p.price) * item.qty)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="border-t border-gray-100 my-4" />

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({itemCount} items)</span>
                      <span className="font-medium">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="flex items-center gap-1">
                        <Truck size={13} />
                        Shipping
                      </span>
                      <span
                        className={`font-medium
                                        ${
                                          shippingFee === 0
                                            ? 'text-green-600'
                                            : ''
                                        }`}
                      >
                        {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                      </span>
                    </div>
                  </div>

                  {/* Coupon Input - ADDED */}
                  <div className="my-4">
                    <CouponInput
                      subtotal={subtotal}
                      appliedCoupon={coupon}
                      onApply={setCoupon}
                      onRemove={() => setCoupon(null)}
                    />
                  </div>

                  {/* Discount Row - shows only when coupon applied */}
                  {coupon && coupon.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 mb-2">
                      <span>Discount ({coupon.code})</span>
                      <span>- {formatPrice(coupon.discount)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-100 my-3" />

                  <div className="flex justify-between items-baseline mb-5">
                    <span className="font-bold text-gray-900">Total</span>
                    <div className="text-right">
                      {coupon && coupon.discount > 0 ? (
                        <>
                          <span className="text-sm line-through text-gray-400 mr-2">
                            {formatPrice(total)}
                          </span>
                          <span className="font-display font-bold text-2xl text-brand-600">
                            {formatPrice(discountedTotal)}
                          </span>
                        </>
                      ) : (
                        <span className="font-display font-bold text-2xl text-brand-600">
                          {formatPrice(total)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Place Order button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2
                               bg-brand-500 text-white font-bold py-4
                               rounded-xl hover:bg-brand-600 transition-colors
                               disabled:opacity-60 active:scale-95 shadow-md
                               text-base"
                  >
                    {loading ? (
                      <span
                        className="w-5 h-5 border-2 border-white/30
                                       border-t-white rounded-full animate-spin"
                      />
                    ) : (
                      <ShieldCheck size={18} />
                    )}
                    {loading ? 'Placing Order…' : 'Place Order'}
                  </button>

                  {/* Trust micro-copy */}
                  <div className="mt-4 space-y-1.5">
                    {[
                      '💵 COD — pay on delivery',
                      '🔒 Your data is secure',
                      '🔄 7-day easy returns'
                    ].map((t) => (
                      <p
                        key={t}
                        className="text-[11px] text-gray-400 text-center"
                      >
                        {t}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

// ── Helpers ───────────────────────────────────────────────
const iCls = (error) =>
  `w-full px-4 py-3 rounded-xl border text-sm bg-gray-50
   focus:bg-white focus:outline-none focus:ring-2
   focus:ring-brand-300 transition-all
   ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'}`

function Section({ title, icon: Icon, children }) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100
                    shadow-sm p-5 sm:p-6"
    >
      <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Icon size={18} className="text-brand-500" />
        {title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, error, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
