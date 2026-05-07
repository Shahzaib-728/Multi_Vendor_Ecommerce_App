import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth'
import { useCartStore } from '../store/cart'
import { useUIStore } from '../store/ui'
import { useNavigate, useLocation } from 'react-router-dom'
import { createOrder } from '../services/orders'
import { MapPin, Truck, CreditCard, User, Phone, AlertCircle, Home, Building2, Globe, ChevronDown } from 'lucide-react'
import { handlePhoneChange, handlePostalCodeChange, isValidPakPhone, getPhoneErrorMessage, validateField } from '../utils/validation'
import { formatCurrency } from '../utils/format'

import { getAvailablePartners, getServiceCoverage } from '../services/user'
import { updateProfile } from '../services/auth'
import StripeContainer from '../components/StripeContainer'
import CheckoutForm from '../components/CheckoutForm'
import SelectMenu from '../components/SelectMenu'

export default function Checkout() {
  const user = useAuthStore(s => s.user)
  const setAuth = useAuthStore(s => s.setAuth)
  const token = useAuthStore(s => s.token)
  const storeItems = useCartStore(s => s.items)
  const clear = useCartStore(s => s.clear)
  const pushToast = useUIStore(s => s.pushToast)
  const openLoginPopup = useUIStore(s => s.openLoginPopup)
  const navigate = useNavigate()
  const location = useLocation()

  // Handle "Buy Now" direct purchase (transient item)
  const directPurchase = location.state?.directPurchase
  const items = directPurchase ? [{ ...directPurchase, qty: directPurchase.qty || 1 }] : storeItems

  const [address, setAddress] = useState({
    receiverName: '',
    phone: '',
    street: '',
    area: '',
    city: '',
    province: '',
    zipCode: '',
    country: 'Pakistan'
  })
  const [errors, setErrors] = useState({})

  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' })

  const [partner, setPartner] = useState('')
  const [deliveryPartners, setDeliveryPartners] = useState([])
  const [partnersLoading, setPartnersLoading] = useState(false)
  const [payment, setPayment] = useState('card')
  const [loading, setLoading] = useState(false)

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
    if (address.province && coverage[address.province]) {
      setAvailableCities(coverage[address.province])
      if (!coverage[address.province].includes(address.city)) {
        setAddress(prev => ({ ...prev, city: coverage[address.province][0] || '' }))
      }
    } else {
      setAvailableCities([])
    }
  }, [address.province, coverage])

  // Fetch partners based on address
  useEffect(() => {
    if (!address.city || !address.province) {
      setDeliveryPartners([])
      return
    }

    const fetchPartners = async () => {
      setPartnersLoading(true)
      try {
        const partners = await getAvailablePartners({ city: address.city, province: address.province })
        setDeliveryPartners(partners)
        if (partner && !partners.find(p => p._id === partner)) {
          setPartner('')
        }
      } catch (error) {
        console.error("Failed to load delivery partners", error)
      } finally {
        setPartnersLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchPartners, 500)
    return () => clearTimeout(timeoutId)
  }, [address.city, address.province])

  // Calculate Totals
  const subtotal = items.reduce((t, i) => {
    const price = i.discountPrice && i.discountPrice < i.price ? i.discountPrice : i.price
    return t + price * (i.qty || 1)
  }, 0)
  const shippingFee = partner ? 150 : 0
  const total = subtotal + shippingFee

  useEffect(() => {
    if (!user) {
      openLoginPopup()
    } else if (user.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses[0];
      setAddress({
        receiverName: defaultAddr.receiverName || user.name || '',
        phone: defaultAddr.phone || '',
        street: defaultAddr.street || '',
        area: defaultAddr.area || '',
        city: defaultAddr.city || '',
        province: defaultAddr.province || '',
        zipCode: defaultAddr.zipCode || '',
        country: defaultAddr.country || 'Pakistan'
      })
    }
  }, [user, openLoginPopup])

  const handleAddressChange = (name, value) => {
    setAddress(prev => ({ ...prev, [name]: value }))
    // Real-time validation
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const onCheckout = async (e) => {
    e.preventDefault()
    if (!user) { openLoginPopup(); return }

    // Final Validation check
    const newErrors = {}
    Object.keys(address).forEach(key => {
      const err = validateField(key, address[key])
      if (err) newErrors[key] = err
    })

    if (Object.values(newErrors).some(err => err !== null)) {
      setErrors(newErrors)
      pushToast({ type: 'error', message: 'Please complete the delivery address correctly' })
      return
    }

    if (!partner) {
      pushToast({ type: 'error', message: 'Please select a delivery partner' })
      return
    }

    setLoading(true)
    try {
      const orderItems = items.map(item => ({
        productId: item._id || item.id,
        qty: item.qty || 1
      }))

      await createOrder({
        items: orderItems,
        deliveryPartnerId: partner,
        address
      })

      try {
        const updatedUser = await updateProfile({ address })
        setAuth(updatedUser, token)
      } catch (err) {
        console.error("Failed to auto-save address", err)
      }

      clear()
      navigate('/orders')
      pushToast({ type: 'success', message: 'Order placed successfully!' })
    } catch (error) {
      console.error(error)
      pushToast({ type: 'error', message: 'Failed to place order' })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentIntent) => {
    setLoading(true)
    try {
      const orderItems = items.map(item => ({
        productId: item._id || item.id,
        qty: item.qty || 1
      }))

      await createOrder({
        items: orderItems,
        deliveryPartnerId: partner,
        address,
        paymentId: paymentIntent.id
      })

      try {
        const updatedUser = await updateProfile({ address })
        setAuth(updatedUser, token)
      } catch (err) {
        console.error("Failed to auto-save address", err)
      }

      clear()
      navigate('/orders')
      pushToast({ type: 'success', message: 'Order placed successfully!' })
    } catch (error) {
      console.error(error)
      pushToast({ type: 'error', message: 'Payment successful but order creation failed. Please contact support.' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return (
    <div className="container py-20 text-center animate-in fade-in duration-500">
      <div className="max-w-md mx-auto bg-stone-50 rounded-3xl p-12 border border-stone-100">
        <User size={48} className="mx-auto mb-6 text-stone-300" />
        <h2 className="text-2xl font-black tracking-tighter mb-4 text-neutral-900">Login Required</h2>
        <p className="text-stone-500 mb-8 font-medium">Please login to proceed with your shopping baggage.</p>
        <button onClick={openLoginPopup} className="w-full bg-neutral-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-black/10 hover:bg-black transition-all active:scale-95">Login Now</button>
      </div>
    </div>
  )

  if (items.length === 0) return (
    <div className="container py-20 text-center animate-in fade-in duration-500">
      <div className="max-w-md mx-auto bg-stone-50 rounded-3xl p-12 border border-stone-100">
        <h2 className="text-2xl font-black tracking-tighter mb-4 text-neutral-900">Your cart is empty</h2>
        <p className="text-stone-500 mb-8 font-medium">Looks like you haven't added anything to your cart yet.</p>
        <button onClick={() => navigate('/products')} className="px-8 py-4 bg-neutral-900 text-white rounded-2xl font-bold shadow-xl shadow-black/10 hover:bg-black transition-all active:scale-95">Start Shopping</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 animate-in fade-in duration-700">
      <div className="mb-12">
        <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-neutral-900 mb-2">Checkout</h1>
        <p className="text-stone-500 font-medium">Complete your personal information and delivery details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        {/* Left Column - Forms */}
        <div className="lg:col-span-8 space-y-12">

          {/* Address Section */}
          <div className="bg-white rounded-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
                <MapPin size={24} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Delivery Address</h2>
            </div>

            <div className="space-y-8">
              {/* Receiver Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 ml-1">Receiver Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                      type="text"
                      required
                      className={`w-full pl-12 pr-4 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-stone-300 font-medium ${errors.receiverName ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                      value={address.receiverName}
                      onChange={e => handleAddressChange('receiverName', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.receiverName && (
                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.receiverName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                      type="tel"
                      required
                      maxLength={11}
                      className={`w-full pl-12 pr-4 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-stone-300 font-medium ${errors.phone ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                      value={address.phone}
                      onChange={e => handlePhoneChange(e.target.value, val => handleAddressChange('phone', val))}
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
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                    type="text"
                    className={`w-full pl-12 pr-4 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-stone-300 font-medium ${errors.street ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                    value={address.street}
                    onChange={e => handleAddressChange('street', e.target.value)}
                    placeholder="House #123, Street 4"
                  />
                </div>
                {errors.street && (
                  <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.street}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 ml-1">Area</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                      type="text"
                      className={`w-full pl-12 pr-4 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-stone-300 font-medium ${errors.area ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                      value={address.area}
                      onChange={e => handleAddressChange('area', e.target.value)}
                      placeholder="DHA Phase 6"
                    />
                  </div>
                  {errors.area && (
                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.area}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 ml-1">ZIP Code</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                      type="text"
                      className={`w-full pl-12 pr-4 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-stone-300 font-medium ${errors.zipCode ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                      value={address.zipCode}
                      onChange={e => handlePostalCodeChange(e.target.value, val => handleAddressChange('zipCode', val))}
                      placeholder="54000"
                    />
                  </div>
                  {errors.zipCode && (
                    <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.zipCode}
                    </p>
                  )}
                </div>
              </div>

              {/* Dynamic Province & City Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 ml-1">Province</label>
                  <div className="relative w-full">
                    <SelectMenu
                      value={address.province}
                      onChange={(v) => handleAddressChange('province', v)}
                      options={[
                        { value: '', label: 'Select Province' },
                        ...availableProvinces.map(p => ({ value: p, label: p }))
                      ]}
                      placeholder="Select Province"
                      className="w-full"
                      buttonClassName="w-full px-5 py-4 border border-stone-100 bg-stone-50/50 hover:bg-stone-50 rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium cursor-pointer pr-10"
                      validationError={errors.province}
                      ariaLabel="Province"
                    />
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={18} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-500 ml-1">City</label>
                  <div className="relative w-full">
                    <SelectMenu
                      value={address.city}
                      onChange={(v) => handleAddressChange('city', v)}
                      options={[
                        { value: '', label: 'Select City' },
                        ...availableCities.map(c => ({ value: c, label: c }))
                      ]}
                      placeholder="Select City"
                      disabled={!address.province}
                      className="w-full"
                      buttonClassName="w-full px-5 py-4 border border-stone-100 bg-stone-50/50 hover:bg-stone-50 rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium cursor-pointer pr-10"
                      validationError={errors.city}
                      ariaLabel="City"
                    />
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-stone-100" />

          {/* Delivery Partner Selection */}
          <div className="bg-white rounded-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
                <Truck size={24} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Delivery Partner</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {partnersLoading ? (
                <div className="col-span-full text-center py-12 text-stone-400 font-medium italic">Finding partners in {address.city}...</div>
              ) : deliveryPartners.length === 0 ? (
                <div className="col-span-full py-8 px-8 bg-amber-50 rounded-3xl border border-amber-100 text-amber-900 text-sm flex flex-col items-center gap-4 text-center">
                  <Truck size={32} className="text-amber-500 mb-2" />
                  <div>
                    <p className="font-bold text-lg mb-1">No delivery partners found</p>
                    <p className="opacity-70 font-medium">We currently don't have active partners in {address.city || 'your area'}. Try selecting a different city or contact support.</p>
                  </div>
                </div>
              ) : (
                deliveryPartners.map(p => (
                  <label key={p._id} className={`group relative border-2 rounded-3xl p-6 cursor-pointer transition-all duration-300 ${partner === p._id ? 'border-neutral-900 bg-neutral-50' : 'border-stone-50 hover:border-stone-200'}`}>
                    <input
                      type="radio"
                      name="partner"
                      value={p._id}
                      checked={partner === p._id}
                      onChange={e => setPartner(e.target.value)}
                      className="hidden"
                    />
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-black text-xl text-neutral-900 tracking-tight">{p.name}</div>
                      {partner === p._id && <div className="w-3 h-3 bg-neutral-900 rounded-full"></div>}
                    </div>
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">{p.vehicleDetails?.vehicleType || 'Courier'} • {formatCurrency(150)} fee</div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="h-px bg-stone-100" />

          {/* Payment Method */}
          <div className="bg-white rounded-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
                <CreditCard size={24} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Secure Payment</h2>
            </div>

            <div className="space-y-8">
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                <p className="text-sm text-stone-500 font-medium leading-relaxed">Your transaction is secured with industry-standard encryption. We never store your card details on our servers.</p>
              </div>

              {!partner ? (
                <div className="py-16 border-2 border-dashed border-stone-100 rounded-3xl text-stone-300 text-center font-bold tracking-tight bg-stone-50/30">
                  Select a delivery partner above to enable checkout
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <StripeContainer>
                    <CheckoutForm
                      amount={total}
                      loading={loading}
                      onPaymentSuccess={handlePaymentSuccess}
                    />
                  </StripeContainer>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-black/[0.03] border border-stone-100">
            <h2 className="text-2xl font-black tracking-tighter mb-8 text-neutral-900">Order Summary</h2>
            <div className="space-y-6 mb-10">
              <div className="flex justify-between text-stone-500 font-medium">
                <span>Subtotal ({items.reduce((a, b) => a + (b.qty || 1), 0)} items)</span>
                <span className="text-neutral-900 font-bold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-500 font-medium">
                <span>Shipping & Handling</span>
                <span className="text-neutral-900 font-bold">{shippingFee === 0 ? '—' : formatCurrency(shippingFee)}</span>
              </div>
              <div className="h-px bg-stone-100 my-2" />
              <div className="flex justify-between items-end">
                <span className="text-neutral-900 font-black text-xl tracking-tighter uppercase">Total</span>
                <span className="text-3xl font-black text-neutral-900 tracking-tighter">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-5 bg-neutral-900 text-white rounded-2xl flex items-start gap-4">
                <div className="mt-1">
                  <ShieldCheck size={18} className="text-neutral-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1">Guaranteed Safe</p>
                  <p className="text-[11px] text-neutral-400 font-medium leading-normal">Your payment is processed through Stripe's secure infrastructure.</p>
                </div>
              </div>

              <p className="text-[10px] text-stone-400 text-center px-4 font-medium italic">
                By confirming this order, you agree to our Terms of Sale and Return Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShieldCheck = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)
