import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, MapPin, Truck, Phone, User, CreditCard, Save, X, Navigation, Award, ShieldCheck, Globe } from 'lucide-react'
import { handlePhoneChange, isValidPakPhone, getPhoneErrorMessage, validateField } from '../../../utils/validation'
import api from '../../../services/api'
import { useAuthStore } from '../../../store/auth'
import { useUIStore } from '../../../store/ui'
import SelectMenu from '../../../components/SelectMenu'

export default function DeliveryProfile() {
    const user = useAuthStore(s => s.user)
    const pushToast = useUIStore(s => s.pushToast)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        vehicleDetails: {
            vehicleType: '',
            licensePlate: ''
        },
        serviceAreas: []
    })
    const [errors, setErrors] = useState({})

    // Vehicle Options
    const vehicleOptions = [
        { value: "Bicycle", label: "Bicycle - Green Delivery" },
        { value: "Bike", label: "Motorbike / Scooter" },
        { value: "Car", label: "Sedan / Hatchback" },
        { value: "Van", label: "Cargo Van / SUV" }
    ]

    // Province Options
    const provinceOptions = [
        'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan',
        'Islamabad Capital Territory', 'Gilgit-Baltistan', 'Azad Kashmir'
    ].map(p => ({ value: p, label: p }))

    const [newCity, setNewCity] = useState('')
    const [newProvince, setNewProvince] = useState('')

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phoneNumber: user.phoneNumber || '',
                vehicleDetails: {
                    vehicleType: user.vehicleDetails?.vehicleType || '',
                    licensePlate: user.vehicleDetails?.licensePlate || ''
                },
                serviceAreas: user.serviceAreas || []
            })
        }
    }, [user])

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.')
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }))
        } else {
            setFormData(prev => ({ ...prev, [field]: value }))
        }

        // Real-time validation
        let error = null
        if (field === 'name') error = value.trim().length < 3 ? 'Name must be at least 3 characters' : null
        if (field === 'phoneNumber') error = getPhoneErrorMessage(value)
        if (field === 'vehicleDetails.vehicleType') error = value ? null : 'Vehicle type is required'
        if (field === 'vehicleDetails.licensePlate') {
            const plateRegex = /^[A-Z0-9- ]+$/i
            if (!value) error = 'License plate is required'
            else if (!plateRegex.test(value)) error = 'Alphanumeric characters only'
            else if (value.length < 3 || value.length > 12) error = '3-12 characters required'
        }

        setErrors(prev => ({ ...prev, [field]: error }))
    }

    const handleAddArea = () => {
        if (newCity && newProvince) {
            const area = `${newCity.trim()}, ${newProvince}`
            if (!formData.serviceAreas.includes(area)) {
                setFormData({
                    ...formData,
                    serviceAreas: [...formData.serviceAreas, area]
                })
                setNewCity('')
                setNewProvince('')
                setErrors(prev => ({ ...prev, serviceAreas: null }))
            } else {
                pushToast({ type: 'error', message: 'This area is already added' })
            }
        } else {
            pushToast({ type: 'error', message: 'Please provide both city and province' })
        }
    }

    const handleRemoveArea = (area) => {
        setFormData({
            ...formData,
            serviceAreas: formData.serviceAreas.filter(a => a !== area)
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Final validation
        const newErrors = {}
        if (formData.name.trim().length < 3) newErrors.name = 'Name must be at least 3 characters'
        const phoneErr = getPhoneErrorMessage(formData.phoneNumber)
        if (phoneErr) newErrors.phoneNumber = phoneErr

        const plate = formData.vehicleDetails.licensePlate
        const plateRegex = /^[A-Z0-9- ]+$/i
        if (!plate) newErrors['vehicleDetails.licensePlate'] = 'License plate is required'
        else if (!plateRegex.test(plate)) newErrors['vehicleDetails.licensePlate'] = 'Invalid characters'
        else if (plate.length < 3 || plate.length > 12) newErrors['vehicleDetails.licensePlate'] = '3-12 characters'

        if (!formData.vehicleDetails.vehicleType) newErrors['vehicleDetails.vehicleType'] = 'Vehicle type is required'
        if (formData.serviceAreas.length === 0) newErrors.serviceAreas = 'At least one service area required'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            pushToast({ type: 'error', message: 'Please fix the errors in your profile' })
            return
        }

        setLoading(true)
        try {
            const res = await api.put('/auth/profile', formData)
            useAuthStore.getState().setAuth(res.data, useAuthStore.getState().token)
            pushToast({ type: 'success', message: 'Profile updated successfully' })
        } catch (err) {
            pushToast({ type: 'error', message: err.response?.data?.error || 'Failed to update profile' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-12 pb-20 px-4 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-10 rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-black/[0.02]">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-stone-900 text-white rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shadow-xl shadow-black/10 shrink-0">
                        <Navigation size={28} className="md:w-9 md:h-9" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-neutral-900">Partner Hub</h1>
                        <p className="text-xs md:text-base text-stone-500 font-medium">Manage your delivery profile and road credentials.</p>
                    </div>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 px-4 md:px-6 py-2 md:py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-widest border border-emerald-100 w-full md:w-auto">
                    <Award size={14} className="md:w-4 md:h-4" />
                    Verified Partner
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {/* Personal Identity */}
                    <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-black/[0.02] space-y-6 md:space-y-8">
                        <div className="flex items-center gap-4 border-b border-stone-50 pb-4 md:pb-6">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-900">
                                <User size={18} className="md:w-5 md:h-5" />
                            </div>
                            <h2 className="text-lg md:text-xl font-bold text-neutral-900 tracking-tight">Personal Identity</h2>
                        </div>

                        <div className="space-y-4 md:space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs md:text-sm font-bold text-neutral-500 ml-1">Full Legal Name</label>
                                <input
                                    className={`w-full px-5 md:px-6 py-3 md:py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium placeholder:text-stone-300 ${errors.name ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                                    value={formData.name}
                                    onChange={e => handleInputChange('name', e.target.value)}
                                    placeholder="Full name as on CNIC"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                                        <AlertCircle size={10} /> {errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs md:text-sm font-bold text-neutral-500 ml-1">Contact Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                    <input
                                        type="tel"
                                        maxLength={11}
                                        className={`w-full pl-12 pr-6 py-3 md:py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium placeholder:text-stone-300 ${errors.phoneNumber ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                                        value={formData.phoneNumber}
                                        onChange={e => handlePhoneChange(e.target.value, val => handleInputChange('phoneNumber', val))}
                                        placeholder="03XXXXXXXXX"
                                        required
                                    />
                                </div>
                                {errors.phoneNumber && (
                                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                                        <AlertCircle size={10} /> {errors.phoneNumber}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fleet Information */}
                    <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-black/[0.02] space-y-6 md:space-y-8">
                        <div className="flex items-center gap-4 border-b border-stone-50 pb-4 md:pb-6">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-900">
                                <Truck size={18} className="md:w-5 md:h-5" />
                            </div>
                            <h2 className="text-lg md:text-xl font-bold text-neutral-900 tracking-tight">Fleet Information</h2>
                        </div>

                        <div className="space-y-4 md:space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs md:text-sm font-bold text-neutral-500 ml-1">Primary Transport Type</label>
                                <SelectMenu
                                    placeholder="Select Vehicle"
                                    options={vehicleOptions}
                                    selected={formData.vehicleDetails.vehicleType}
                                    onChange={(val) => handleInputChange('vehicleDetails.vehicleType', val)}
                                    validationError={errors['vehicleDetails.vehicleType']}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs md:text-sm font-bold text-neutral-500 ml-1">Registration Plate</label>
                                <input
                                    className={`w-full px-5 md:px-6 py-3 md:py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium placeholder:text-stone-300 ${errors['vehicleDetails.licensePlate'] ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                                    placeholder="e.g. LEC-24-1234"
                                    value={formData.vehicleDetails.licensePlate}
                                    onChange={e => handleInputChange('vehicleDetails.licensePlate', e.target.value.toUpperCase())}
                                    required
                                />
                                {errors['vehicleDetails.licensePlate'] && (
                                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                                        <AlertCircle size={10} /> {errors['vehicleDetails.licensePlate']}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logistics Coverage */}
                <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-black/[0.02] space-y-6 md:space-y-8">
                    <div className="flex items-center justify-between border-b border-stone-50 pb-4 md:pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-900">
                                <MapPin size={18} className="md:w-5 md:h-5" />
                            </div>
                            <h2 className="text-lg md:text-xl font-bold text-neutral-900 tracking-tight">Logistics Coverage</h2>
                        </div>
                        {errors.serviceAreas && (
                            <p className="text-[10px] text-red-500 flex items-center gap-1 font-bold">
                                <AlertCircle size={12} /> {errors.serviceAreas}
                            </p>
                        )}
                    </div>

                    <div className="space-y-6 md:space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 p-1 md:p-2">
                            <div className="md:col-span-4">
                                <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-stone-400 mb-2 block ml-1">Province</label>
                                <SelectMenu
                                    placeholder="Select Region"
                                    options={provinceOptions}
                                    selected={newProvince}
                                    onChange={setNewProvince}
                                />
                            </div>
                            <div className="md:col-span-5">
                                <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-stone-400 mb-2 block ml-1">Operational City</label>
                                <div className="relative">
                                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                                    <input
                                        className="w-full pl-12 pr-6 py-3.5 md:py-4 border border-stone-100 bg-stone-50 rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium placeholder:text-stone-300 cursor-text"
                                        placeholder="e.g. Islamabad"
                                        value={newCity}
                                        onChange={e => setNewCity(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleAddArea()
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-3 flex items-end">
                                <button
                                    type="button"
                                    onClick={handleAddArea}
                                    className="w-full bg-neutral-900 text-white px-6 py-3.5 md:py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95"
                                >
                                    Expansion Zone
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 md:gap-4 p-4 md:p-2 bg-stone-50/50 rounded-3xl min-h-[100px] items-center justify-center">
                            {formData.serviceAreas.map(area => (
                                <div key={area} className="group bg-white text-neutral-900 px-4 md:px-6 py-2 md:py-3 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-3 border border-stone-100 hover:border-black hover:shadow-xl hover:shadow-black/5 transition-all">
                                    <MapPin size={16} className="text-stone-300 group-hover:text-black transition-colors" />
                                    {area}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveArea(area)}
                                        className="text-stone-300 hover:text-red-500 transition-colors ml-1"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            {formData.serviceAreas.length === 0 && (
                                <div className="text-center py-4">
                                    <p className="text-stone-400 text-xs md:text-sm font-medium italic">Define your operational boundaries above.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center bg-stone-900 p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-black/20 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center text-white/40">
                            <ShieldCheck size={20} className="md:w-6 md:h-6" />
                        </div>
                        <p className="text-white/60 text-[10px] md:text-xs font-medium max-w-xs text-center md:text-left">
                            Your road credentials and service zones are securely synchronized with our dispatch engine.
                        </p>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto bg-white text-stone-900 px-8 md:px-12 py-4 md:py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-3 hover:bg-stone-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Synchronizing...' : 'Save Operations'}
                        <Save size={16} className="md:w-[18px]" />
                    </button>
                </div>
            </form>
        </div>
    )
}
