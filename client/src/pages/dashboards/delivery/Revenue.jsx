import { useState, useEffect } from 'react'
import { DollarSign, Wallet, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'
import { getDeliveryRevenue } from '../../../services/delivery'
import { useUIStore } from '../../../store/ui'
import { formatCurrency } from '../../../utils/format'

export default function DeliveryRevenue() {
    const [data, setData] = useState({
        totalEarnings: 0,
        totalDeliveredValue: 0,
        deliveredCount: 0,
        orders: []
    })
    const [loading, setLoading] = useState(true)
    const pushToast = useUIStore(s => s.pushToast)

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const res = await getDeliveryRevenue()
                setData(res)
            } catch (err) {
                console.error(err)
                pushToast({ type: 'error', message: 'Failed to fetch revenue data' })
            } finally {
                setLoading(false)
            }
        }
        fetchRevenue()
    }, [])

    if (loading) return <div className="p-10 text-center">Loading revenue data...</div>

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Earnings & Payouts</h1>
                <p className="text-slate-500">Track your delivery income based on completed orders.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-500 rounded-xl p-6 text-white shadow-lg shadow-emerald-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <DollarSign size={20} />
                        </div>
                        <span className="font-medium opacity-90">Total Earnings</span>
                    </div>
                    <div className="text-3xl font-bold">{formatCurrency(data.totalEarnings)}</div>
                    <div className="text-xs opacity-80 mt-1">5% Commission on Delivered Value</div>
                </div>
                <div className="bg-amber-500 rounded-xl p-6 text-white shadow-lg shadow-amber-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
                            <Wallet size={20} />
                        </div>
                        <span className="font-medium opacity-90">Pending Payout</span>
                    </div>
                    <div className="text-3xl font-bold">{formatCurrency(data.totalEarnings)}</div>
                    <div className="text-xs opacity-80 mt-1">Ready for withdrawal</div>
                </div>
                <div className="bg-white border p-6 rounded-xl shadow-sm">
                    <div className="text-sm text-slate-500 mb-1">Delivered Orders</div>
                    <div className="text-xl font-bold text-slate-900">{data.deliveredCount}</div>
                    <div className="text-xs text-emerald-600">Total Value: {formatCurrency(data.totalDeliveredValue)}</div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ArrowUpRight size={20} className="text-slate-400" /> Recent Delivered Orders
                </h3>
                {data.orders.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No completed deliveries yet.</div>
                ) : (
                    <div className="space-y-3">
                        {data.orders.map(order => (
                            <div key={order._id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">Order #{order._id.slice(-6).toUpperCase()}</div>
                                        <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-emerald-600">+{formatCurrency(order.totalAmount * 0.05)}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Commission</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
