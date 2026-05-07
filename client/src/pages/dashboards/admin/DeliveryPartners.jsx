import { useState, useEffect } from 'react'
import { Plus, Trash2, Mail, MapPin, Phone, DollarSign, AlertCircle } from 'lucide-react'
import { handlePhoneChange, validateField } from '../../../utils/validation'
import { getUsers, addDeliveryPartner, deleteUser } from '../../../services/admin'
import { useUIStore } from '../../../store/ui'
import { formatCurrency } from '../../../utils/format'

export default function AdminDeliveryPartners() {
    const [partners, setPartners] = useState([])
    const [showAddForm, setShowAddForm] = useState(false)
    const [newPartner, setNewPartner] = useState({ name: '', email: '', phoneNumber: '', password: '' })
    const [errors, setErrors] = useState({})
    const pushToast = useUIStore(s => s.pushToast)

    useEffect(() => {
        fetchPartners()
    }, [])

    const fetchPartners = async () => {
        try {
            const users = await getUsers()
            const deliveryPartners = users.filter(u => u.role === 'Delivery')
            setPartners(deliveryPartners.map(p => ({
                id: p._id,
                name: p.name,
                email: p.email,
                phone: p.phoneNumber || 'N/A',
                area: p.vehicleDetails?.vehicleType || 'N/A', // Using vehicle type as area placeholder for now
                status: p.deliveryStatus || 'Offline',
                earnings: 0 // Mock earnings for now
            })))
        } catch (err) {
            console.error(err)
            pushToast({ type: 'error', message: 'Failed to fetch partners' })
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this delivery partner? This action cannot be undone.')) {
            try {
                await deleteUser(id)
                pushToast({ type: 'success', message: 'Delivery partner deleted successfully' })
                setPartners(prev => prev.filter(p => p.id !== id))
            } catch (err) {
                console.error(err)
                pushToast({ type: 'error', message: 'Failed to delete partner' })
            }
        }
    }

    const handlePay = (id) => {
        setPartners(partners.map(p => p.id === id ? { ...p, earnings: 0 } : p))
        pushToast({ type: 'success', message: 'Payment transferred successfully.' })
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        const newErrors = {
            name: validateField('name', newPartner.name),
            email: validateField('email', newPartner.email),
            phoneNumber: newPartner.phoneNumber ? validateField('phoneNumber', newPartner.phoneNumber) : null,
            password: validateField('password', newPartner.password)
        }
        if (Object.values(newErrors).some(v => v)) {
            setErrors(newErrors)
            pushToast({ type: 'error', message: 'Please fill all required fields correctly' })
            return
        }
        try {
            await addDeliveryPartner({
                name: newPartner.name,
                email: newPartner.email,
                phoneNumber: newPartner.phoneNumber,
                password: newPartner.password
            })
            pushToast({ type: 'success', message: 'Delivery Partner Added' })
            setNewPartner({ name: '', email: '', phoneNumber: '', password: '' })
            setErrors({})
            setShowAddForm(false)
            fetchPartners()
        } catch (err) {
            pushToast({ type: 'error', message: err.response?.data?.error || 'Failed to add partner' })
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Delivery Partners</h1>
                    <p className="text-slate-500">Manage delivery logistics partners and view their details.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Add Partner
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-top-4">
                    <h3 className="font-semibold text-slate-900 mb-4">New Delivery Partner</h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <input
                                type="text" placeholder="Partner Name" className={`border p-2 rounded-lg w-full ${errors.name ? 'border-red-500' : ''}`}
                                value={newPartner.name} onChange={e => {
                                    const v = e.target.value
                                    setNewPartner({ ...newPartner, name: v })
                                    setErrors(prev => ({ ...prev, name: validateField('name', v) }))
                                }}
                                required
                            />
                            {errors.name && (
                                <p className="text-[10px] text-red-500 flex items-center gap-1">
                                    <AlertCircle size={10} /> {errors.name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <input
                                type="email" placeholder="Email Address" className={`border p-2 rounded-lg w-full ${errors.email ? 'border-red-500' : ''}`}
                                value={newPartner.email} onChange={e => {
                                    const v = e.target.value
                                    setNewPartner({ ...newPartner, email: v })
                                    setErrors(prev => ({ ...prev, email: validateField('email', v) }))
                                }}
                                required
                            />
                            {errors.email && (
                                <p className="text-[10px] text-red-500 flex items-center gap-1">
                                    <AlertCircle size={10} /> {errors.email}
                                </p>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="tel"
                                maxLength={11}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all ${errors.phoneNumber ? 'border-red-500' : ''}`}
                                placeholder="03XXXXXXXXX"
                                value={newPartner.phoneNumber}
                                onChange={e => handlePhoneChange(e.target.value, val => {
                                    setNewPartner({ ...newPartner, phoneNumber: val })
                                    setErrors(prev => ({ ...prev, phoneNumber: val ? validateField('phoneNumber', val) : null }))
                                })}
                            />
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                        {errors.phoneNumber && (
                            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                                <AlertCircle size={10} /> {errors.phoneNumber}
                            </p>
                        )}
                        <input
                            type="password" placeholder="Password (min 6 characters)" className={`border p-2 rounded-lg w-full ${errors.password ? 'border-red-500' : ''}`}
                            value={newPartner.password} onChange={e => {
                                const v = e.target.value
                                setNewPartner({ ...newPartner, password: v })
                                setErrors(prev => ({ ...prev, password: validateField('password', v) }))
                            }}
                            required
                            minLength={6}
                        />
                        {errors.password && (
                            <p className="text-[10px] text-red-500 -mt-3 md:col-span-2 flex items-center gap-1">
                                <AlertCircle size={10} /> {errors.password}
                            </p>
                        )}
                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                            >
                                Create Partner Account
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {partners.length === 0 && !showAddForm ? (
                <div className="text-center py-10 text-slate-500">No delivery partners found. Add one to get started.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {partners.map(partner => (
                        <div key={partner.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
                            <button
                                onClick={() => handleDelete(partner.id)}
                                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                                <Trash2 size={18} />
                            </button>
                            <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xl mb-4">
                                {partner.name[0]}
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg mb-1">{partner.name}</h3>
                            <div className="space-y-2 mt-4 text-sm text-slate-600">
                                <div className="flex items-center gap-3">
                                    <Mail size={16} className="text-slate-400" />
                                    {partner.email}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone size={16} className="text-slate-400" />
                                    {partner.phone}
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin size={16} className="text-slate-400" />
                                    {partner.area} (Vehicle Type)
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-slate-500 text-sm">Accumulated Earnings</span>
                                    <span className="font-bold text-slate-900">{formatCurrency(partner.earnings)}</span>
                                </div>
                                {partner.earnings > 0 ? (
                                    <button
                                        onClick={() => handlePay(partner.id)}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <DollarSign size={16} /> Pay Out
                                    </button>
                                ) : (
                                    <div className="text-center text-xs text-slate-400 py-2">No pending payments</div>
                                )}
                                <button
                                    onClick={() => handleDelete(partner.id)}
                                    className="w-full mt-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Trash2 size={16} /> Delete Partner
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
