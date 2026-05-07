import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Store, UserPlus } from 'lucide-react'
import { authAPI } from '../../api'
import PageMeta from '../../components/shared/PageMeta'
import { toast } from 'sonner'

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    phone: z
      .string()
      .regex(/^0[0-9]{10}$/, 'Enter a valid Pakistani phone (03XXXXXXXXX)')
      .optional()
      .or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

export default function Register() {
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authAPI.register({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password
      })
      toast.success('OTP sent to your email!')
      navigate('/verify-otp', {
        state: { email: data.email, name: data.name }
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageMeta title="Create Account" />
      <div
        className="min-h-screen bg-cream flex items-center
                      justify-center px-4 py-12"
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 justify-center"
            >
              <Store className="text-brand-500" size={32} />
              <span className="font-display font-bold text-2xl text-brand-700">
                Kapra Store
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-4">
              Create Your Account
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Join thousands of happy customers
            </p>
          </div>

          <div
            className="bg-white rounded-3xl shadow-sm border
                          border-gray-100 p-8"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <FormField label="Full Name" error={errors.name?.message}>
                <input
                  {...register('name')}
                  placeholder="Aisha Khan"
                  className={inputClass(errors.name)}
                />
              </FormField>

              {/* Email */}
              <FormField label="Email Address" error={errors.email?.message}>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className={inputClass(errors.email)}
                />
              </FormField>

              {/* Phone (optional) */}
              <FormField
                label={
                  <span>
                    Phone Number{' '}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </span>
                }
                error={errors.phone?.message}
              >
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="03001234567"
                  className={inputClass(errors.phone)}
                />
              </FormField>

              {/* Password */}
              <FormField label="Password" error={errors.password?.message}>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    className={`${inputClass(errors.password)} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </FormField>

              {/* Confirm Password */}
              <FormField
                label="Confirm Password"
                error={errors.confirmPassword?.message}
              >
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Re-enter password"
                  className={inputClass(errors.confirmPassword)}
                />
              </FormField>

              {/* Terms */}
              <p className="text-xs text-gray-400 text-center pt-1">
                By registering, you agree to our{' '}
                <Link
                  to="/shipping-returns"
                  className="text-brand-600 hover:underline"
                >
                  Return Policy
                </Link>{' '}
                and{' '}
                <Link to="/faq" className="text-brand-600 hover:underline">
                  FAQ
                </Link>
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2
                           bg-brand-500 text-white font-bold py-3.5
                           rounded-xl hover:bg-brand-600 transition-colors
                           disabled:opacity-60 active:scale-95"
              >
                {loading ? (
                  <span
                    className="w-5 h-5 border-2 border-white/30
                                   border-t-white rounded-full animate-spin"
                  />
                ) : (
                  <UserPlus size={18} />
                )}
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 border-t border-gray-100" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 border-t border-gray-100" />
            </div>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-brand-600 font-bold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

// Tiny helpers
const inputClass = (error) =>
  `w-full px-4 py-3 rounded-xl border text-sm bg-gray-50
   focus:bg-white focus:outline-none focus:ring-2
   focus:ring-brand-300 transition-all
   ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'}`

function FormField({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
