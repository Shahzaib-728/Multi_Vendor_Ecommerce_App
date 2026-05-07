import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Users, Clock, CheckCircle, ArrowRight, Building, Truck, Eye, CreditCard, AlertCircle, ArrowUpRight } from 'lucide-react'
import { getFinanceAnalytics, getFinancePayouts, getUserInvoice, processUserPayout } from '../../../services/wallet'
import { useUIStore } from '../../../store/ui'
import { formatCurrency } from '../../../utils/format'
import { io } from 'socket.io-client'

export default function AdminFinance() {
    const [analytics, setAnalytics] = useState({ totalSales: 0, platformProfit: 0, totalPaidOut: 0, pendingPayouts: 0 })
    const [payouts, setPayouts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedInvoice, setSelectedInvoice] = useState(null)
    const [invoiceLoading, setInvoiceLoading] = useState(false)
    const pushToast = useUIStore(s => s.pushToast)

    useEffect(() => {
        fetchData()
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000')
        socket.on('connect', () => { socket.emit('join_user_room', 'admin_finance') })
        socket.on('finance_updated', () => { fetchData() })
        return () => socket.disconnect()
    }, [])

    const fetchData = async () => {
        try {
            const [analyticsData, payoutsData] = await Promise.all([
                getFinanceAnalytics(),
                getFinancePayouts()
            ])
            setAnalytics(analyticsData)
            setPayouts(payoutsData)
        } catch (err) {
            console.error('Failed to fetch finance data:', err)
        } finally {
            setLoading(false)
        }
    }


    const handleViewInvoice = async (userId) => {
        setInvoiceLoading(true)
        try {
            const invoice = await getUserInvoice(userId)
            setSelectedInvoice(invoice)
        } catch (err) {
            pushToast({ type: 'error', message: 'Failed to load invoice' })
        } finally {
            setInvoiceLoading(false)
        }
    }

    const handleProcessPayout = async (userId) => {
        if (!confirm('Process payout for this user? This will mark all available earnings as paid.')) return
        try {
            await processUserPayout(userId)
            pushToast({ type: 'success', message: 'Payout processed successfully' })
            setSelectedInvoice(null)
            fetchData()
        } catch (err) {
            pushToast({ type: 'error', message: 'Failed to process payout' })
        }
    }

    if (loading) {
        return <div className="p-24 text-center text-slate-500">Loading Treasury...</div>
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Finance & Payouts</h1>
                <p className="text-slate-500">Oversee platform revenue and manage settlements.</p>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard label="Total Sales" value={formatCurrency(analytics.totalSales)} icon={<DollarSign size={20} />} color="blue" />
                <StatCard label="Platform Profit" value={formatCurrency(analytics.platformProfit)} icon={<TrendingUp size={20} />} color="emerald" />
                <StatCard label="Pending Payouts" value={formatCurrency(analytics.pendingPayouts)} icon={<Clock size={20} />} color="amber" />
            </div>

            {/* Summary Banner */}
            {payouts.filter(p => p.availableBalance > 0).length > 0 && (
                <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-lg font-bold mb-1">Payouts Ready</h2>
                        <p className="text-slate-400 text-sm">
                            {payouts.filter(p => p.availableBalance > 0).length} users have available balances awaiting settlement.
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-400 mb-1">Total Outstanding</p>
                        <p className="text-3xl font-black">
                            {formatCurrency(payouts.reduce((sum, p) => sum + p.availableBalance, 0))}
                        </p>
                    </div>
                </div>
            )}

            {/* Payouts Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">Pending Settlements</h3>
                </div>

                {payouts.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No pending payouts at this time.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Partner</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Available</th>
                                        <th className="px-6 py-4">In Escrow</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payouts.map((p) => (
                                        <tr key={p.userId} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                                                        {p.storeName?.[0] || p.name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{p.storeName || p.name}</p>
                                                        <p className="text-xs text-slate-500">{p.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase">{p.role}</span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-emerald-600">
                                                {formatCurrency(p.availableBalance)}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {formatCurrency(p.pendingBalance)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleViewInvoice(p.userId)} className="p-2 text-slate-400 hover:text-slate-600"><Eye size={18} /></button>
                                                    {p.availableBalance > 0 && (
                                                        <button onClick={() => handleProcessPayout(p.userId)} className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition-colors">Process Payout</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {payouts.map((p) => (
                                <div key={p.userId} className="p-4 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm shrink-0">
                                            {p.storeName?.[0] || p.name?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{p.storeName || p.name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-slate-500">{p.email}</p>
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">{p.role}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Available</p>
                                            <p className="text-lg font-black text-emerald-600">{formatCurrency(p.availableBalance)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">In Escrow</p>
                                            <p className="text-lg font-black text-slate-400">{formatCurrency(p.pendingBalance)}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => handleViewInvoice(p.userId)} className="flex-1 border border-slate-200 text-slate-600 px-4 py-3 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                            <Eye size={14} /> View Invoice
                                        </button>
                                        {p.availableBalance > 0 && (
                                            <button onClick={() => handleProcessPayout(p.userId)} className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl text-xs font-bold hover:bg-black transition-colors">
                                                Process Payout
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Invoice Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-2xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col mx-auto my-auto transition-all">
                        <div className="p-5 border-b flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                            <div>
                                <h3 className="font-bold text-slate-900">Detailed Invoice</h3>
                                <p className="text-xs text-slate-500">{selectedInvoice.user.storeName || selectedInvoice.user.name}</p>
                            </div>
                            <button onClick={() => setSelectedInvoice(null)} className="p-2 bg-white rounded-full border border-slate-200 text-slate-400 hover:text-slate-900 transition-colors">
                                <span className="text-xl font-bold leading-none block -mt-0.5">×</span>
                            </button>
                        </div>

                        <div className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                    <p className="text-xs font-semibold text-emerald-600 mb-1">Available For Release</p>
                                    <p className="text-2xl font-bold text-emerald-700">{formatCurrency(selectedInvoice.balance.currentBalance)}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <p className="text-xs font-semibold text-slate-500 mb-1">In Escrow</p>
                                    <p className="text-2xl font-bold text-slate-400">{formatCurrency(selectedInvoice.balance.pendingBalance)}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {selectedInvoice.transactions.map((tx) => (
                                        <div key={tx.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{tx.description}</p>
                                                <p className="text-[10px] text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-emerald-600">+{formatCurrency(tx.amount)}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{tx.status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedInvoice.user.bankDetails && (
                                <div className="bg-slate-900 p-6 rounded-2xl text-white">
                                    <h3 className="text-xs font-bold text-slate-400 mb-3">Bank Settlement Information</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-slate-400">Bank Name</p>
                                            <p className="text-sm font-bold">{selectedInvoice.user.bankDetails.bankName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400">Account Number</p>
                                            <p className="text-sm font-mono">•••• {selectedInvoice.user.bankDetails.accountNumber?.slice(-4) || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedInvoice.balance.currentBalance > 0 && (
                                <button
                                    onClick={() => handleProcessPayout(selectedInvoice.user.id)}
                                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                                >
                                    Authorize Settlement ({formatCurrency(selectedInvoice.balance.currentBalance)})
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatCard({ label, value, icon, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100'
    }
    return (
        <div className={`bg-white p-6 rounded-2xl border ${colors[color]} shadow-sm`}>
            <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl bg-white shadow-sm border ${colors[color]}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">{label}</p>
                <p className="text-2xl font-black text-slate-900">{value}</p>
            </div>
        </div>
    )
}
