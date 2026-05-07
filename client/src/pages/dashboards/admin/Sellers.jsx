import { useState, useEffect } from 'react'
import { Search, Shield, Ban, ExternalLink, CheckCircle, XCircle, DollarSign, Wallet, ArrowUpRight, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getUsers, deleteUser, getPendingSellers, approveSeller } from '../../../services/admin'
import { useUIStore } from '../../../store/ui'

export default function AdminSellers() {
    const [activeTab, setActiveTab] = useState('active') // active, pending
    const [sellers, setSellers] = useState([])
    const [pendingList, setPendingList] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const pushToast = useUIStore(s => s.pushToast)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [allUsers, pending] = await Promise.all([
                getUsers(),
                getPendingSellers()
            ])
            setSellers(allUsers.filter(u => u.role === 'Seller'))
            setPendingList(pending)
        } catch (err) {
            console.error(err)
            pushToast({ type: 'error', message: 'Failed to fetch sellers' })
        } finally {
            setLoading(false)
        }
    }

    const toggleBlock = async (id) => {
        try {
            const confirmed = window.confirm('Are you sure you want to toggle block status for this seller?')
            if (!confirmed) return
            await deleteUser(id)
            pushToast({ type: 'success', message: 'Status updated' })
            fetchData()
        } catch (err) {
            pushToast({ type: 'error', message: 'Failed to update status' })
        }
    }

    const handleApprove = async (id) => {
        try {
            await approveSeller(id)
            pushToast({ type: 'success', message: 'Seller Approved' })
            fetchData()
        } catch (err) {
            pushToast({ type: 'error', message: 'Failed to approve seller' })
        }
    }

    const filteredSellers = sellers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.sellerDetails?.storeName || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return <div className="p-24 text-center text-slate-500 font-medium">Loading partner network...</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Merchant Partners</h1>
                    <p className="text-slate-500">Verify and manage active sellers on the platform.</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Active Sellers
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Applications
                        {pendingList.length > 0 && <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{pendingList.length}</span>}
                    </button>
                </div>
            </div>

            {activeTab === 'active' && (
                <div className="space-y-6">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search active sellers..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Merchant</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredSellers.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-slate-400">No sellers found.</td>
                                        </tr>
                                    ) : (
                                        filteredSellers.map((seller) => (
                                            <tr key={seller._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                                                            {seller.name[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900">{seller.name}</div>
                                                            <div className="text-xs text-slate-500">{seller.sellerDetails?.storeName || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{seller.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${seller.sellerDetails?.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                        {seller.sellerDetails?.approvalStatus || 'PENDING'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => toggleBlock(seller._id)} className={`p-2 rounded-lg transition-all ${seller.blocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'}`}>
                                                        {seller.blocked ? <CheckCircle size={18} /> : <Ban size={18} />}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {filteredSellers.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">No sellers found.</div>
                            ) : (
                                filteredSellers.map((seller) => (
                                    <div key={seller._id} className="p-4 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                                    {seller.name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{seller.name}</div>
                                                    <div className="text-xs text-slate-500">{seller.sellerDetails?.storeName || 'N/A'}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5">{seller.email}</div>
                                                </div>
                                            </div>
                                            <button onClick={() => toggleBlock(seller._id)} className={`p-2 rounded-lg transition-all ${seller.blocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'}`}>
                                                {seller.blocked ? <CheckCircle size={18} /> : <Ban size={18} />}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${seller.sellerDetails?.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                {seller.sellerDetails?.approvalStatus || 'PENDING'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'pending' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Desktop Table */}
                    <div className="overflow-x-auto hidden md:block">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Applicant</th>
                                    <th className="px-6 py-4">Business Details</th>
                                    <th className="px-6 py-4">Documents</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {pendingList.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-16 text-center text-slate-400">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <UserCheck size={32} />
                                            </div>
                                            <p className="font-bold text-slate-900 text-lg">No pending applications</p>
                                            <p className="text-sm">All merchant requests have been processed.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    pendingList.map((applicant) => (
                                        <tr key={applicant._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{applicant.name}</div>
                                                <div className="text-xs text-slate-500">{applicant.email}</div>
                                                <div className="text-[10px] text-slate-400 font-mono mt-1">{applicant.sellerDetails?.businessPhone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 text-sm">{applicant.sellerDetails?.storeName}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase">{applicant.sellerDetails?.category}</div>
                                                <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[200px]">{applicant.sellerDetails?.businessAddress}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <span className="font-bold text-slate-400 uppercase">Tax ID:</span>
                                                        <span className="font-mono text-slate-700">{applicant.sellerDetails?.documents?.taxId || 'N/A'}</span>
                                                    </div>
                                                    {applicant.sellerDetails?.documents?.proofOfIdentity && (
                                                        <a href={applicant.sellerDetails.documents.proofOfIdentity} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1.5 text-xs font-bold">
                                                            <ExternalLink size={12} /> View Identity
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleApprove(applicant._id)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all">Approve</button>
                                                    <button onClick={() => toggleBlock(applicant._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">Reject</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {pendingList.length === 0 ? (
                            <div className="px-6 py-16 text-center text-slate-400">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserCheck size={32} />
                                </div>
                                <p className="font-bold text-slate-900 text-lg">No pending applications</p>
                                <p className="text-sm">All merchant requests have been processed.</p>
                            </div>
                        ) : (
                            pendingList.map((applicant) => (
                                <div key={applicant._id} className="p-4 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-slate-900">{applicant.name}</div>
                                            <div className="text-xs text-slate-500">{applicant.email}</div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{applicant.sellerDetails?.businessPhone}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-slate-900 text-sm">{applicant.sellerDetails?.storeName}</div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase">{applicant.sellerDetails?.category}</div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-xl space-y-2">
                                        <div className="text-[10px] text-slate-400 mb-1">{applicant.sellerDetails?.businessAddress}</div>
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-bold text-slate-400 uppercase">Tax ID:</span>
                                                <span className="font-mono text-slate-700">{applicant.sellerDetails?.documents?.taxId || 'N/A'}</span>
                                            </div>
                                            {applicant.sellerDetails?.documents?.proofOfIdentity && (
                                                <a href={applicant.sellerDetails.documents.proofOfIdentity} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1.5 font-bold">
                                                    <ExternalLink size={12} /> View ID
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button onClick={() => handleApprove(applicant._id)} className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl text-xs font-bold hover:bg-black transition-all">Approve</button>
                                        <button onClick={() => toggleBlock(applicant._id)} className="flex-1 border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl text-xs font-bold transition-all">Reject</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
