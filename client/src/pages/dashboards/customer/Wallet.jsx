import { useState, useEffect } from 'react'
import { Wallet, Clock, CheckCircle, ArrowDownRight, Package } from 'lucide-react'
import { getWalletBalance, getTransactionHistory } from '../../../services/wallet'
import { useAuthStore } from '../../../store/auth'

export default function CustomerWallet() {
    const [balance, setBalance] = useState({ currentBalance: 0, pendingBalance: 0 })
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const user = useAuthStore(s => s.user)

    useEffect(() => {
        fetchData()
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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    if (loading) {
        return <div className="p-10 text-center text-slate-500">Loading wallet...</div>
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">My Wallet</h1>
                <p className="text-slate-500 text-sm">Track your refunds and credits.</p>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-primary to-primary/80 p-8 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <Wallet size={32} />
                    </div>
                    <div>
                        <span className="text-primary-foreground/70 text-sm font-bold uppercase tracking-wider">Available Funds</span>
                        <div className="text-5xl font-black">{formatCurrency(balance.currentBalance)}</div>
                    </div>
                </div>
                <div className="bg-black/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 text-primary-foreground/80 font-bold mb-1">
                        <Clock size={16} /> Pending Refunds
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(balance.pendingBalance)}</div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{transactions.length} Total</span>
                </div>

                {transactions.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Clock size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No transactions recorded</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">Your refunds and credits will appear here once processed.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {transactions.map((tx) => (
                            <div key={tx._id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'Refund' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        <ArrowDownRight size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{tx.description || tx.type}</p>
                                        <p className="text-xs text-slate-400 font-medium tracking-tight uppercase">{formatDate(tx.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-green-600 text-lg">
                                        +{formatCurrency(tx.amount)}
                                    </p>
                                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'Available' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{tx.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
