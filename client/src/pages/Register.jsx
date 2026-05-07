import { useState } from 'react'
import { register } from '../services/auth'
import { useAuthStore } from '../store/auth'
import { useUIStore } from '../store/ui'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { validateField } from '../utils/validation'
import SelectMenu from '../components/SelectMenu'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Customer'
  })
  const [errors, setErrors] = useState({})

  const navigate = useNavigate()
  const push = useUIStore(s => s.pushToast)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Real-time validation
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const onSubmit = async e => {
    e.preventDefault()

    // Final validation check
    const newErrors = {}
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key])
      if (err) newErrors[key] = err
    })

    if (Object.values(newErrors).some(err => err !== null)) {
      setErrors(newErrors)
      push({ type: 'error', message: 'Please fix the errors in the form' })
      return
    }

    try {
      await register(formData)
      push({ type: 'success', message: 'Registration successful! Please login.' })
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      push({ type: 'error', message: err.response?.data?.message || 'Registration failed' })
    }
  }

  return (
    <div className="container py-12 grid md:grid-cols-2 gap-12 items-center">
      <div className="rounded-3xl bg-neutral-900 text-white p-12 shadow-2xl h-full flex flex-col justify-center">
        <h2 className="text-4xl font-black tracking-tighter mb-4">Join Urban Edge</h2>
        <p className="text-neutral-400 text-lg leading-relaxed">Create an account to track orders, manage your profile, and more.</p>
        <div className="mt-12 space-y-6">
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">✓</div>
            <p className="font-semibold">Fast & Secure Checkout</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">✓</div>
            <p className="font-semibold">Order Tracking & History</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">✓</div>
            <p className="font-semibold">Exclusive Member Discounts</p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white border border-stone-100 rounded-3xl p-10 shadow-xl space-y-6">
        <div>
          <label className="text-sm font-bold text-neutral-900 block mb-2 px-1">Full Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Jane Doe"
            type="text"
            required
            className={`w-full px-5 py-4 border ${errors.name ? 'border-red-500' : 'border-stone-200'} rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-stone-300`}
          />
          {errors.name && (
            <p className="text-[10px] text-red-500 mt-2 ml-2 flex items-center gap-1">
              <AlertCircle size={10} /> {errors.name}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-bold text-neutral-900 block mb-2 px-1">Email Address</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="jane@example.com"
            type="email"
            required
            className={`w-full px-5 py-4 border ${errors.email ? 'border-red-500' : 'border-stone-200'} rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-stone-300`}
          />
          {errors.email && (
            <p className="text-[10px] text-red-500 mt-2 ml-2 flex items-center gap-1">
              <AlertCircle size={10} /> {errors.email}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-bold text-neutral-900 block mb-2 px-1">Password</label>
          <input
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            type="password"
            required
            placeholder="••••••••"
            className={`w-full px-5 py-4 border ${errors.password ? 'border-red-500' : 'border-stone-200'} rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-stone-300`}
          />
          {errors.password && (
            <p className="text-[10px] text-red-500 mt-2 ml-2 flex items-center gap-1">
              <AlertCircle size={10} /> {errors.password}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-bold text-neutral-900 block mb-2 px-1">I want to join as a</label>
          <SelectMenu
            value={formData.role}
            onChange={(v) => handleInputChange({ target: { name: 'role', value: v } })}
            options={[
              { value: 'Customer', label: 'Customer (Shop & Order)' },
              { value: 'Seller', label: 'Seller (Sell Products)' }
            ]}
            className="w-full"
            buttonClassName="w-full px-5 py-4 border border-stone-200 rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all cursor-pointer bg-white"
            validationError={errors.role}
            ariaLabel="Role"
          />
        </div>
        <button className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 mt-4">
          Create Account
        </button>
      </form>
    </div>
  )
}
