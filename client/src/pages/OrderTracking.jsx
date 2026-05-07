import { useState } from 'react'
import { Search, Package, CheckCircle, Truck, Clock } from 'lucide-react'
import { useOrderStore } from '../store/orders'
import { useUIStore } from '../store/ui'

export default function OrderTracking() {
    const [orderId, setOrderId] = useState('')
    const [status, setStatus] = useState(null)
    const [loading, setLoading] = useState(false)

    const getOrder = useOrderStore(s => s.getOrder)
    const pushToast = useUIStore(s => s.pushToast)

    const handleTrack = (e) => {
        e.preventDefault()
        if (!orderId) return
        setLoading(true)

        setTimeout(() => {
            const order = getOrder(orderId)
            if (order) {
                setStatus(order)
            } else {
                setStatus(null)
                pushToast({ type: 'error', message: 'Order ID not found' })
            }
            setLoading(false)
        }, 500)
    }

    return (
        <div className="container py-16 max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-4">Track Your Order</h1>
                <p className="text-slate-500">Enter your order ID to check the current status of your delivery.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
                <form onSubmit={handleTrack} className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Enter Order ID (e.g., ORD-12345)"
                            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            value={orderId}
                            onChange={e => setOrderId(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70"
                    >
                        {loading ? 'Tracking...' : 'Track'}
                    </button>
                </form>
            </div>

            {status && (
                <div className="bg-white p-8 rounded-xl shadow-sm border animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b">
                        <div>
                            <div className="text-sm text-slate-500 mb-1">Order ID</div>
                            <div className="font-bold text-lg">#{status.id}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-500 mb-1">Estimated Delivery</div>
                            <div className="font-bold text-lg">{status.date}</div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                        <div className="space-y-8 relative">
                            <div className="flex gap-6">
                                <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center border-4 ${status.status === 'Processing' || status.status === 'Shipped' || status.status === 'Delivered' ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                                    <Clock size={24} />
                                </div>
                                <div className="pt-2">
                                    <h3 className={`font-bold text-lg ${status.status === 'Processing' || status.status === 'Shipped' || status.status === 'Delivered' ? 'text-green-700' : 'text-slate-900'}`}>Order Processed</h3>
                                    <p className="text-slate-500">Your order has been confirmed and is being prepared.</p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center border-4 ${status.status === 'Shipped' || status.status === 'Out for Delivery' || status.status === 'Delivered' ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                                    <Truck size={24} />
                                </div>
                                <div className="pt-2">
                                    <h3 className={`font-bold text-lg ${status.status === 'Shipped' || status.status === 'Out for Delivery' || status.status === 'Delivered' ? 'text-green-700' : 'text-slate-900'}`}>Shipped</h3>
                                    <p className="text-slate-500">Your order has been picked up by the delivery partner.</p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center border-4 ${status.status === 'Delivered' ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                                    <CheckCircle size={24} />
                                </div>
                                <div className="pt-2">
                                    <h3 className={`font-bold text-lg ${status.status === 'Delivered' ? 'text-green-700' : 'text-slate-900'}`}>Delivered</h3>
                                    <p className="text-slate-500">Package has been delivered to your address.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
