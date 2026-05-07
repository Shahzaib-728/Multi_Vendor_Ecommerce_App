import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, User, Home, Building2, Save, AlertCircle, Package, RotateCcw, Globe, Mail, ShieldCheck, ChevronDown } from 'lucide-react'
import { handlePhoneChange, handlePostalCodeChange, isValidPakPhone, getPhoneErrorMessage, validateField } from '../../../utils/validation'
import { useAuthStore } from '../../../store/auth'
import { useUIStore } from '../../../store/ui'
import { updateProfile } from '../../../services/auth'
import { getServiceCoverage } from '../../../services/user'
import SelectMenu from '../../../components/SelectMenu'

export default function Profile() {
  const user = useAuthStore(s => s.user)
  const setAuth = useAuthStore(s => s.setAuth)
  const token = useAuthStore(s => s.token)
  const pushToast = useUIStore(s => s.pushToast)

  const defaultAddr = user?.addresses?.[0] || {}

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: {
      receiverName: defaultAddr.receiverName || user?.name || '',
      phone: defaultAddr.phone || '',
      street: defaultAddr.street || '',
      area: defaultAddr.area || '',
      city: defaultAddr.city || '',
      province: defaultAddr.province || '',
      zipCode: defaultAddr.zipCode || '',
      country: defaultAddr.country || 'Pakistan'
    }
  })
  const [errors, setErrors] = useState({})

  // Service Coverage Data
  const [coverage, setCoverage] = useState({})
  const [availableProvinces, setAvailableProvinces] = useState([])
  const [availableCities, setAvailableCities] = useState([])

  // Load Coverage Data
  useEffect(() => {
    getServiceCoverage().then(data => {
      setCoverage(data)
      setAvailableProvinces(Object.keys(data))
    }).catch(err => console.error("Failed to load coverage", err))
  }, [])

  // Update Cities when Province Changes
  useEffect(() => {
    if (formData.address.province && coverage[formData.address.province]) {
      setAvailableCities(coverage[formData.address.province])
    } else {
      setAvailableCities([])
    }
  }, [formData.address.province, coverage])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleAddrChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }))
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Final validation
    const newErrors = {}
    const nameErr = validateField('name', formData.name)
    if (nameErr) newErrors.name = nameErr
    Object.keys(formData.address).forEach(key => {
      const err = validateField(key, formData.address[key])
      if (err) newErrors[key] = err
    })

    if (Object.values(newErrors).some(v => v !== null)) {
      setErrors(newErrors)
      pushToast({ type: 'error', message: 'Please fix the errors in your profile' })
      return
    }

    try {
      const updatedUser = await updateProfile({
        name: formData.name,
        email: formData.email,
        address: formData.address
      })
      setAuth(updatedUser, token)
      setIsEditing(false)
      pushToast({ type: 'success', message: 'Profile updated successfully' })
    } catch (err) {
      pushToast({ type: 'error', message: err.response?.data?.message || 'Failed to update profile' })
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-neutral-900 mb-2">My Profile</h1>
          <p className="text-stone-500 font-medium">Manage your personal settings and delivery preferences.</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(!isEditing)
            setErrors({})
          }}
          className={`px-8 py-3 rounded-2xl font-bold transition-all active:scale-95 ${isEditing ? 'text-stone-400 hover:text-neutral-900' : 'bg-neutral-900 text-white shadow-xl shadow-black/10 hover:bg-black'}`}
        >
          {isEditing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link to="/orders" className="flex items-center gap-4 p-8 bg-white border border-stone-100 rounded-[2rem] hover:shadow-xl hover:shadow-black/[0.02] hover:border-neutral-900 transition-all group">
          <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-neutral-900 group-hover:text-white transition-all">
            <Package size={24} />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-stone-400 group-hover:text-neutral-900 transition-colors">Order History</span>
            <p className="text-sm font-bold text-neutral-900">Track and manage past orders</p>
          </div>
        </Link>
        <Link to="/refunds" className="flex items-center gap-4 p-8 bg-white border border-stone-100 rounded-[2rem] hover:shadow-xl hover:shadow-black/[0.02] hover:border-neutral-900 transition-all group">
          <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-neutral-900 group-hover:text-white transition-all">
            <RotateCcw size={24} />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-stone-400 group-hover:text-neutral-900 transition-colors">Refunds</span>
            <p className="text-sm font-bold text-neutral-900">Manage your returns</p>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-black/[0.02] border border-stone-100">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-stone-50 pb-6">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center">
                  <User size={20} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Identity Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 ml-1">Full Name</label>
                  <input
                    type="text"
                    className={`w-full px-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium ${errors.name ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                  />
                  {errors.name && (
                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 ml-1">Email (Primary)</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                    <input
                      type="email"
                      className="w-full pl-12 pr-6 py-4 border border-stone-100 bg-stone-50 text-stone-400 rounded-2xl cursor-not-allowed font-medium"
                      value={formData.email}
                      disabled
                      title="Email cannot be changed"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-stone-50 pb-6">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Default Shipping</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 ml-1">Receiver Name</label>
                  <input
                    type="text"
                    className={`w-full px-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium ${errors.receiverName ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                    value={formData.address.receiverName}
                    onChange={e => handleAddrChange('receiverName', e.target.value)}
                  />
                  {errors.receiverName && (
                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.receiverName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                    <input
                      type="tel"
                      maxLength={11}
                      className={`w-full pl-12 pr-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium ${errors.phone ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                      value={formData.address.phone}
                      onChange={e => handlePhoneChange(e.target.value, val => handleAddrChange('phone', val))}
                      placeholder="03XXXXXXXXX"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-500 ml-1">Street Address</label>
                <div className="relative">
                  <Home className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  <input
                    type="text"
                    className={`w-full pl-12 pr-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium ${errors.street ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                    value={formData.address.street}
                    onChange={e => handleAddrChange('street', e.target.value)}
                  />
                </div>
                {errors.street && (
                  <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.street}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 ml-1">Area / Locality</label>
                  <div className="relative">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                    <input
                      type="text"
                      className={`w-full pl-12 pr-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium ${errors.area ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                      value={formData.address.area}
                      onChange={e => handleAddrChange('area', e.target.value)}
                    />
                  </div>
                  {errors.area && (
                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.area}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 ml-1">ZIP / Postal Code</label>
                  <div className="relative">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                    <input
                      type="text"
                      className={`w-full pl-12 pr-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium ${errors.zipCode ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                      value={formData.address.zipCode}
                      onChange={e => handlePostalCodeChange(e.target.value, val => handleAddrChange('zipCode', val))}
                    />
                  </div>
                  {errors.zipCode && (
                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.zipCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 ml-1">Province</label>
                  <div className="relative w-full">
                    <SelectMenu
                      value={formData.address.province}
                      onChange={(v) => handleAddrChange('province', v)}
                      options={[
                        { value: '', label: 'Select Province' },
                        ...availableProvinces.map(p => ({ value: p, label: p }))
                      ]}
                      placeholder="Select Province"
                      className="w-full"
                      buttonClassName="w-full px-6 py-4 border border-stone-100 bg-stone-50/50 hover:bg-stone-50 rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium cursor-pointer pr-10"
                      validationError={errors.province}
                      ariaLabel="Province"
                    />
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 ml-1">City</label>
                  <div className="relative w-full">
                    <SelectMenu
                      value={formData.address.city}
                      onChange={(v) => handleAddrChange('city', v)}
                      options={[
                        { value: '', label: 'Select City' },
                        ...availableCities.map(c => ({ value: c, label: c }))
                      ]}
                      placeholder="Select City"
                      disabled={!formData.address.province}
                      className="w-full"
                      buttonClassName="w-full px-6 py-4 border border-stone-100 bg-stone-50/50 hover:bg-stone-50 rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium cursor-pointer pr-10"
                      validationError={errors.city}
                      ariaLabel="City"
                    />
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 flex justify-end">
              <button
                type="submit"
                className="bg-neutral-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-black shadow-xl shadow-black/10 transition-all active:scale-95 flex items-center gap-3"
              >
                <Save size={18} /> Save Profile Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-stone-50 pb-6">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center">
                  <User size={20} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Identity Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase tracking-widest text-stone-400">Full Name</div>
                  <div className="text-lg font-bold text-neutral-900">{user?.name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase tracking-widest text-stone-400">Email Address</div>
                  <div className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    {user?.email}
                    <ShieldCheck size={16} className="text-green-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase tracking-widest text-stone-400">Account Status</div>
                  <div className="text-lg font-bold text-neutral-900 capitalize">Verified {user?.role}</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-stone-50 pb-6">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Default Shipping</h3>
              </div>
              {defaultAddr.street ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-1">
                    <div className="text-xs font-black uppercase tracking-widest text-stone-400">Receiver</div>
                    <div className="text-lg font-bold text-neutral-900">{defaultAddr.receiverName}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-black uppercase tracking-widest text-stone-400">Phone</div>
                    <div className="text-lg font-bold text-neutral-900">{defaultAddr.phone}</div>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <div className="text-xs font-black uppercase tracking-widest text-stone-400">Address</div>
                    <div className="text-lg font-bold text-neutral-900 leading-relaxed max-w-md">
                      {defaultAddr.street}, {defaultAddr.area}, {defaultAddr.city}, {defaultAddr.province} {defaultAddr.zipCode}, {defaultAddr.country}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 px-8 bg-stone-50 rounded-3xl border border-dashed border-stone-200 text-center animate-pulse">
                  <MapPin className="mx-auto mb-4 text-stone-300" size={32} />
                  <p className="text-stone-400 font-bold tracking-tight">No delivery address saved yet.</p>
                  <p className="text-stone-400 text-xs font-medium mt-1">Add one to speed up your future checkouts.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
