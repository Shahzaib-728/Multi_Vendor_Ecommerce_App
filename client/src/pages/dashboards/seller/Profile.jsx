import { useState, useEffect } from 'react'
import api from '../../../services/api'
import { useAuthStore } from '../../../store/auth'
import { useUIStore } from '../../../store/ui'
import { CheckCircle, AlertCircle, Building, FileText, CreditCard, ShieldCheck, Phone, Store, MapPin, Briefcase, Landmark, Hash, User } from 'lucide-react'
import { handlePhoneChange, isValidPakPhone, getPhoneErrorMessage, validateField } from '../../../utils/validation'

export default function SellerProfile() {
    const user = useAuthStore(s => s.user)
    const pushToast = useUIStore(s => s.pushToast)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        storeName: '',
        businessAddress: '',
        ntnNumber: '',
        strnNumber: '',
        businessPhone: '',
        bankName: '',
        accountNumber: '',
        swiftRoutingCode: '',
        accountHolder: ''
    })
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (user?.sellerDetails) {
            setFormData({
                storeName: user.sellerDetails.storeName || '',
                businessAddress: user.sellerDetails.businessAddress || '',
                ntnNumber: user.sellerDetails.ntnNumber || user.sellerDetails.panNumber || '',
                strnNumber: user.sellerDetails.strnNumber || user.sellerDetails.gstNumber || '',
                businessPhone: user.sellerDetails.businessPhone || '',
                bankName: user.sellerDetails.bankDetails?.bankName || '',
                accountNumber: user.sellerDetails.bankDetails?.accountNumber || '',
                swiftRoutingCode: user.sellerDetails.bankDetails?.swiftRoutingCode || user.sellerDetails.bankDetails?.ifscCode || '',
                accountHolder: user.sellerDetails.bankDetails?.accountHolder || ''
            })
        }
    }, [user])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // Real-time validation
        const error = validateField(name, value)
        setErrors(prev => ({ ...prev, [name]: error }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Final validation
        const newErrors = {}
        Object.keys(formData).forEach(key => {
            const err = validateField(key, formData[key])
            if (err) newErrors[key] = err
        })

        if (Object.values(newErrors).some(v => v !== null)) {
            setErrors(newErrors)
            pushToast({ type: 'error', message: 'Please correct the validation errors' })
            return
        }

        setLoading(true)
        try {
            const payload = {
                storeName: formData.storeName,
                businessAddress: formData.businessAddress,
                businessPhone: formData.businessPhone,
                ntnNumber: formData.ntnNumber,
                strnNumber: formData.strnNumber,
                bankDetails: {
                    bankName: formData.bankName,
                    accountNumber: formData.accountNumber,
                    swiftRoutingCode: formData.swiftRoutingCode,
                    accountHolder: formData.accountHolder
                }
            }
            const res = await api.put('/auth/profile', { sellerDetails: payload })
            useAuthStore.getState().setAuth(res.data, useAuthStore.getState().token)
            pushToast({ type: 'success', message: 'Profile update request submitted for approval' })
        } catch (err) {
            pushToast({ type: 'error', message: err.response?.data?.error || 'Failed to update profile' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20 px-4 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-black/[0.02]">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-stone-900 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-black/10">
                        <Store size={36} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-neutral-900">{formData.storeName || 'Your Store'}</h1>
                        <p className="text-stone-500 font-medium">{user?.email}</p>
                    </div>
                </div>
                <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest border ${user?.isApproved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {user?.isApproved ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                    {user?.isApproved ? 'Verified Merchant' : 'Verification Pending'}
                </div>
            </div>

            {!user?.isApproved && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-[2rem] p-8 flex items-start gap-6">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-amber-900 tracking-tight">Onboarding in Progress</h3>
                        <p className="text-amber-800/80 text-sm font-medium mt-1 leading-relaxed">Your business identity is under review by our compliance team. Direct listing capabilities will be activated once your NTN and Bank details are verified.</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Business Identity */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-black/[0.02] space-y-8">
                        <div className="flex items-center gap-4 border-b border-stone-50 pb-6">
                            <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-900">
                                <Briefcase size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Business Identity</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-500 ml-1">Official Store Name</label>
                                <input
                                    name="storeName"
                                    className={`w-full px-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium placeholder:text-stone-300 ${errors.storeName ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                                    value={formData.storeName}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Apex Global Trading"
                                    required
                                />
                                {errors.storeName && (
                                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                                        <AlertCircle size={10} /> {errors.storeName}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-500 ml-1">Headquarters Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                    <input
                                        name="businessAddress"
                                        className={`w-full pl-12 pr-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium placeholder:text-stone-300 ${errors.businessAddress ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                                        value={formData.businessAddress}
                                        onChange={handleInputChange}
                                        placeholder="Full business location"
                                        required
                                    />
                                </div>
                                {errors.businessAddress && (
                                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                                        <AlertCircle size={10} /> {errors.businessAddress}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-500 ml-1">Business Contact</label>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                    <input
                                        name="businessPhone"
                                        type="tel"
                                        maxLength={11}
                                        className={`w-full pl-12 pr-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium ${errors.businessPhone ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                                        value={formData.businessPhone}
                                        onChange={e => handlePhoneChange(e.target.value, val => handleInputChange({ target: { name: 'businessPhone', value: val } }))}
                                        placeholder="03XXXXXXXXX"
                                        required
                                    />
                                </div>
                                {errors.businessPhone && (
                                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                                        <AlertCircle size={10} /> {errors.businessPhone}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tax & Compliance */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-black/[0.02] space-y-8">
                        <div className="flex items-center gap-4 border-b border-stone-50 pb-6">
                            <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-900">
                                <FileText size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Tax & Compliance</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-500 ml-1">NTN (National Tax Number)</label>
                                <div className="relative">
                                    <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                    <input
                                        name="ntnNumber"
                                        className={`w-full pl-12 pr-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium ${errors.ntnNumber ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                                        value={formData.ntnNumber}
                                        placeholder="1234567-8"
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                {errors.ntnNumber && (
                                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                                        <AlertCircle size={10} /> {errors.ntnNumber}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-500 ml-1">STRN (Sales Tax Registration)</label>
                                <div className="relative">
                                    <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                    <input
                                        name="strnNumber"
                                        className={`w-full pl-12 pr-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium ${errors.strnNumber ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                                        value={formData.strnNumber}
                                        placeholder="13-digit code"
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                {errors.strnNumber && (
                                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                                        <AlertCircle size={10} /> {errors.strnNumber}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100">
                            <p className="text-[11px] text-stone-400 font-medium leading-relaxed italic">
                                * Tax documents must match the business owner\'s CNIC for successful verification.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Financial Infrastructure */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-black/[0.02] space-y-8">
                    <div className="flex items-center gap-4 border-b border-stone-50 pb-6">
                        <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-900">
                            <Landmark size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Financial Infrastructure</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-500 ml-1">Primary Bank Name</label>
                                <input
                                    name="bankName"
                                    className={`w-full px-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium placeholder:text-stone-300 ${errors.bankName ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                                    value={formData.bankName}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Habib Bank Limited"
                                    required
                                />
                                {errors.bankName && (
                                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                                        <AlertCircle size={10} /> {errors.bankName}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-500 ml-1">IBAN / Account Number</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                    <input
                                        name="accountNumber"
                                        className={`w-full pl-12 pr-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium ${errors.accountNumber ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                                        value={formData.accountNumber}
                                        onChange={handleInputChange}
                                        placeholder="Min 10 digits"
                                        required
                                    />
                                </div>
                                {errors.accountNumber && (
                                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                                        <AlertCircle size={10} /> {errors.accountNumber}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-500 ml-1">SWIFT / Branch Identifier</label>
                                <input
                                    name="swiftRoutingCode"
                                    className={`w-full px-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium placeholder:text-stone-300 ${errors.swiftRoutingCode ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                                    value={formData.swiftRoutingCode}
                                    placeholder="Branch code or SWIFT"
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.swiftRoutingCode && (
                                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                                        <AlertCircle size={10} /> {errors.swiftRoutingCode}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-500 ml-1">Official Account Holder</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                    <input
                                        name="accountHolder"
                                        className={`w-full pl-12 pr-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium placeholder:text-stone-300 ${errors.accountHolder ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                                        value={formData.accountHolder}
                                        onChange={handleInputChange}
                                        placeholder="Name as on Bank statement"
                                        required
                                    />
                                </div>
                                {errors.accountHolder && (
                                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                                        <AlertCircle size={10} /> {errors.accountHolder}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-neutral-900 hover:bg-black text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-2xl shadow-black/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Securely Update Profile'}
                        <CheckCircle size={18} />
                    </button>
                </div>
            </form>
        </div>
    )
}
