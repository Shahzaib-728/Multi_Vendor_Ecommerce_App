import { useEffect, useState } from 'react'
import { getPayouts, settlePayout } from '../../../services/admin'
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { useUIStore } from '../../../store/ui'
import { formatCurrency } from '../../../utils/format'

export default function AdminPayouts() {
    const [payouts, setPayouts] = useState([])
    const [loading, setLoading] = useState(true)
    const pushToast = useUIStore(s => s.pushToast)

    const fetchPayouts = async () => {
        setLoading(true)
        try {
            const data = await getPayouts()
            setPayouts(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPayouts()
    }, [])

    const handleSettle = async (sellerId) => {
        if (!confirm('Mark all pending earnings for this seller as PAID? This cannot be undone.')) return
        try {
            await settlePayout(sellerId)
            pushToast({ type: 'success', message: 'Payout marked as settled' })
            fetchPayouts()
        } catch (err) {
            pushToast({ type: 'error', message: 'Failed to settle payout' })
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Loading payouts...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Seller Payouts</h1>
                    <p className="text-slate-500">Manage pending withdrawals for delivered orders.</p>
                </div>
            </div>

            {payouts.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-dashed text-center text-slate-500">
                    <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
                    <h3 className="text-lg font-semibold text-slate-900">All Caught Up!</h3>
                    <p>No pending payouts available for settlement.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {payouts.map((p) => (
                        <div key={p.userId} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-lg">{p.storeName || p.name} <span className='text-xs font-normal text-gray-500'>({p.role})</span></h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border">
                                    <div>
                                        <span className="font-semibold block text-xs text-slate-400 uppercase">Bank Name</span>
                                        {p.bankDetails?.bankName || 'N/A'}
                                    </div>
                                    <div>
                                        <span className="font-semibold block text-xs text-slate-400 uppercase">Account Number</span>
                                        {p.bankDetails?.accountNumber || 'N/A'}
                                    </div>
                                    <div>
                                        <span className="font-semibold block text-xs text-slate-400 uppercase">Account Holder</span>
                                        {p.bankDetails?.accountHolder || 'N/A'}
                                    </div>
                                    <div>
                                        <span className="font-semibold block text-xs text-slate-400 uppercase">SWIFT / Branch Code</span>
                                        {p.bankDetails?.swiftRoutingCode || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-3 min-w-[200px]">
                                <div>
                                    <div className="text-sm text-slate-500">Pending Amount</div>
                                    <div className="text-3xl font-bold text-emerald-600">{formatCurrency(p.walletBalance)}</div>
                                </div>
                                <button
                                    onClick={() => handleSettle(p.userId)}
                                    className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors w-full md:w-auto"
                                >
                                    Mark as Paid
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

