import { useState } from 'react'
import { useAuthStore } from '../store/auth'
import { useUIStore } from '../store/ui'
import { X, AlertCircle, ChevronDown } from 'lucide-react'
import { validateField } from '../utils/validation'
import SelectMenu from './SelectMenu'

import { useNavigate } from 'react-router-dom'

export default function LoginPopup() {
    const [isRegister, setIsRegister] = useState(false)
    const [formData, setFormData] = useState({ email: '', password: '', name: '', role: 'Customer' })
    const [errors, setErrors] = useState({})
    const login = useAuthStore(s => s.login)
    const register = useAuthStore(s => s.register)
    const close = useUIStore(s => s.closeLoginPopup)
    const pushToast = useUIStore(s => s.pushToast)
    const navigate = useNavigate()

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // Real-time validation
        const error = validateField(name, value)
        setErrors(prev => ({ ...prev, [name]: error }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Final validation check before submit
        const newErrors = {}
        Object.keys(formData).forEach(key => {
            if (isRegister || (key === 'email' || key === 'password')) {
                const err = validateField(key, formData[key])
                if (err) newErrors[key] = err
            }
        })

        if (isRegister && formData.role === 'Seller') {
            const storeName = formData.storeDetails?.storeName
            const err = validateField('storeName', storeName)
            if (err) newErrors.storeName = err
        }

        if (Object.values(newErrors).some(err => err !== null)) {
            setErrors(newErrors)
            pushToast({ type: 'error', message: 'Please fix the errors in the form' })
            return
        }

        try {
            if (isRegister) {
                await register(formData)
                pushToast({ type: 'success', message: 'Registration successful! Please sign in.' })
                setIsRegister(false) // Switch to login view
                setFormData({ ...formData, password: '' }) // Clear password for security
                setErrors({})
            } else {
                await login(formData.email, formData.password)
                const user = useAuthStore.getState().user
                pushToast({ type: 'success', message: 'Logged in successfully' })

                // Redirect based on role
                if (user?.role === 'Seller') navigate('/seller/revenue')
                else if (user?.role === 'Admin') navigate('/admin/analytics')
                else if (user?.role === 'Delivery') navigate('/delivery/assigned')
                else if (user?.role === 'Support') navigate('/support/tickets')
                close()
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Authentication failed'
            pushToast({ type: 'error', message: msg })
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] backdrop-blur-md p-4 sm:p-8">
            <div className="bg-white p-6 sm:p-10 w-full max-w-[340px] sm:max-w-md relative shadow-2xl rounded-3xl border border-white/20 max-h-[90vh] overflow-y-auto mx-auto my-auto scrollbar-hide">
                <button onClick={close} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
                    <X size={24} />
                </button>
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-slate-900">{isRegister ? 'Join Our Community' : 'Welcome Back'}</h2>
                    <p className="text-slate-500 mt-2 text-sm">{isRegister ? 'Create your account to get started.' : 'Sign in to access your dashboard.'}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="Jane Doe"
                                    className={`w-full bg-slate-50 border ${errors.name ? 'border-red-500' : 'border-slate-200'} p-4 rounded-xl focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900`}
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                                {errors.name && (
                                    <p className="text-[10px] text-red-500 ml-2 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                        <AlertCircle size={10} /> {errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-600 ml-1">I want to join as a</label>
                                <div className="relative w-full">
                                    <SelectMenu
                                        value={formData.role}
                                        onChange={(v) => handleInputChange({ target: { name: 'role', value: v } })}
                                        options={[
                                            { value: 'Customer', label: 'Customer' },
                                            { value: 'Seller', label: 'Seller' }
                                        ]}
                                        className="w-full"
                                        buttonClassName="w-full bg-slate-50 border border-slate-200 p-4 pr-10 rounded-xl focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all font-medium text-slate-900 cursor-pointer"
                                        validationError={errors.role}
                                        ariaLabel="Role"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <ChevronDown size={14} />
                                    </div>
                                </div>
                            </div>
                            {formData.role === 'Seller' && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-600 ml-1">Store Name</label>
                                    <input
                                        type="text"
                                        name="storeName"
                                        required
                                        className={`w-full bg-slate-50 border p-4 rounded-xl focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900 ${errors.storeName ? 'border-red-500' : 'border-slate-200'}`}
                                        placeholder="My Awesome Store"
                                        onChange={e => {
                                            const storeName = e.target.value
                                            setFormData(prev => ({ ...prev, storeDetails: { ...(prev.storeDetails || {}), storeName } }))
                                            const error = validateField('storeName', storeName)
                                            setErrors(prev => ({ ...prev, storeName: error }))
                                        }}
                                    />
                                    {errors.storeName && (
                                        <p className="text-[10px] text-red-500 ml-2 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                            <AlertCircle size={10} /> {errors.storeName}
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-600 ml-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="jane@example.com"
                            className={`w-full bg-slate-50 border ${errors.email ? 'border-red-500' : 'border-slate-200'} p-4 rounded-xl focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900`}
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        {errors.email && (
                            <p className="text-[10px] text-red-500 ml-2 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle size={10} /> {errors.email}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-600 ml-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="••••••••"
                            className={`w-full bg-slate-50 border ${errors.password ? 'border-red-500' : 'border-slate-200'} p-4 rounded-xl focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900`}
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                        {errors.password && (
                            <p className="text-[10px] text-red-500 ml-2 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle size={10} /> {errors.password}
                            </p>
                        )}
                    </div>
                    {/* {!isRegister && (
                        <div className="flex justify-end pr-1">
                            <button
                                type="button"
                                onClick={() => { close(); navigate('/forgot-password') }}
                                className="text-xs font-semibold text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )} */}
                    <button type="submit" className="w-full bg-slate-900 text-white py-4 hover:bg-black transition-all font-bold text-sm mt-4 rounded-xl shadow-lg shadow-slate-900/10 active:scale-95">
                        {isRegister ? 'Create Account' : 'Login'}
                    </button>
                    {isRegister && (
                        <p className="text-[10px] text-slate-400 text-center px-4">
                            By creating an account, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    )}
                </form>
                <div className="mt-10 flex flex-col items-center gap-4 text-sm font-semibold text-slate-400">
                    <div>
                        {isRegister ? 'Already a member?' : "Don't have an account?"}
                        <button
                            onClick={() => {
                                setIsRegister(!isRegister)
                                setErrors({})
                            }}
                            className="ml-2 text-slate-900 border-b-2 border-slate-900 pb-0.5 hover:text-slate-600 hover:border-slate-600 transition-all"
                        >
                            {isRegister ? 'Sign In' : 'Register Now'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
