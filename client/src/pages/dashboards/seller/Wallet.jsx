import { useState, useEffect } from 'react'
import { Wallet, Clock, CheckCircle, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react'
import { getWalletBalance, getTransactionHistory } from '../../../services/wallet'
import { io } from 'socket.io-client'
import { useAuthStore } from '../../../store/auth'

export default function SellerWallet() {
    const [balance, setBalance] = useState({ currentBalance: 0, pendingBalance: 0 })
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const user = useAuthStore(s => s.user)

    useEffect(() => {
        fetchData()
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000')
        socket.on('connect', () => { if (user?._id) socket.emit('join_user_room', user._id) })
        socket.on('wallet_updated', () => { fetchData() })
        return () => socket.disconnect()
    }, [user])

    const fetchData = async () => {
        try {
            const [balanceData, txData] = await Promise.all([
                getWalletBalance(),
                getTransactionHistory()
            ])
            setBalance(balanceData)
            setTransactions(txData.transactions || [])
        } catch (err) {
            console.error('Failed to fetch wallet data:', err)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const formatCurrency = (amount) => {
        return `Rs. ${new Intl.NumberFormat('en-PK', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0)}`
    }

    const getStatusStyle = (status, availableAt) => {
        const now = new Date()
        const available = new Date(availableAt)
        if (status === 'Paid') return 'bg-slate-900 text-white'
        if (available <= now || status === 'Available') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
        return 'bg-amber-50 text-amber-700 border-amber-100'
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Loading wallet...</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Earnings & Wallet</h1>
                <p className="text-slate-500">Manage your revenue and payouts.</p>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Wallet size={24} />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">Available</span>
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-500 mb-1">Total Balance</div>
                        <div className="text-4xl font-bold text-slate-900">
                            {formatCurrency(balance.currentBalance)}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <Clock size={24} />
                        </div>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase">In Escrow</span>
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-500 mb-1">Pending Clearance</div>
                        <div className="text-4xl font-bold text-slate-900">
                            {formatCurrency(balance.pendingBalance)}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-2xl shadow-xl flex flex-col justify-between text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/10 rounded-xl">
                            <ArrowDownRight size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase">Settled</span>
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-400 mb-1">Total Withdrawn</div>
                        <div className="text-4xl font-bold">
                            {formatCurrency(transactions.filter(t => t.status === 'Paid').reduce((sum, t) => sum + t.amount, 0))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">Transaction History</h2>
                </div>

                {transactions.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No transactions found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        {/* Desktop View (Table) */}
                        <table className="w-full text-left hidden md:table">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Transaction</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.map((tx) => (
                                    <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${(tx.type === 'Payout' || tx.type === 'Refund' || tx.amount < 0) ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    {(tx.type === 'Payout' || tx.type === 'Refund' || tx.amount < 0) ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                                </div>
                                                <span className="font-semibold text-slate-900">{tx.description || tx.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            {formatDate(tx.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(tx.status, tx.availableAt)}`}>
                                                {tx.status === 'Paid' ? 'Paid' : (new Date(tx.availableAt) <= new Date() ? 'Available' : 'Pending')}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold text-lg ${(tx.type === 'Payout' || tx.type === 'Refund' || tx.amount < 0) ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {(tx.type === 'Payout' || tx.type === 'Refund' || tx.amount < 0) ? '' : '+'}{formatCurrency(tx.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile View (Cards) */}
                        <div className="md:hidden space-y-4 p-4">
                            {transactions.map((tx) => (
                                <div key={tx._id} className="bg-slate-50 rounded-xl p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${(tx.type === 'Payout' || tx.type === 'Refund' || tx.amount < 0) ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {(tx.type === 'Payout' || tx.type === 'Refund' || tx.amount < 0) ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 line-clamp-1">{tx.description || tx.type}</p>
                                                <p className="text-xs text-slate-500">{formatDate(tx.createdAt)}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border ${getStatusStyle(tx.status, tx.availableAt)}`}>
                                            {tx.status === 'Paid' ? 'Paid' : (new Date(tx.availableAt) <= new Date() ? 'Available' : 'Pending')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</span>
                                        <span className={`text-lg font-black ${(tx.type === 'Payout' || tx.type === 'Refund' || tx.amount < 0) ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {(tx.type === 'Payout' || tx.type === 'Refund' || tx.amount < 0) ? '' : '+'}{formatCurrency(tx.amount)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
