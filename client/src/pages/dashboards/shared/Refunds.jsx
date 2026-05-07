import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/auth';
import { AlertCircle, Clock, CheckCircle, ShieldAlert, ChevronRight, Package, Image as ImageIcon, History, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import RefundActionCard from '../../../components/RefundActionCard';

export default function Refunds() {
    const user = useAuthStore(s => s.user);
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        fetchRefunds();
    }, []);

    const fetchRefunds = async () => {
        try {
            const endpoint = user.role === 'Seller' ? '/refunds/seller' :
                user.role === 'Support' ? '/refunds/disputed' :
                    '/refunds/my-requests';
            const { data } = await api.get(endpoint);
            setRefunds(data);
        } catch (err) {
            console.error('Failed to fetch refunds', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Disputed_By_Seller': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'Return_Pending':
            case 'In_Return_Transit': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Returned':
            case 'Refunded': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-stone-50 text-stone-600 border-stone-100';
        }
    };

    const filteredRefunds = refunds.filter(r => {
        if (activeTab === 'pending') return r.status === 'Pending';
        if (activeTab === 'transit') return ['Disputed_By_Seller', 'Return_Pending', 'In_Return_Transit', 'Returned'].includes(r.status);
        if (activeTab === 'closed') return ['Refunded', 'Rejected'].includes(r.status);
        return true;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
            <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Processing requests...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-neutral-900">Refund Management</h1>
                    <p className="text-stone-500 font-medium">Coordinate returns and track resolution status.</p>
                </div>
                {user.role === 'Seller' && (
                    <div className="flex items-center gap-2 px-6 py-3 bg-stone-100 rounded-2xl text-xs font-black uppercase tracking-widest text-stone-600 self-start md:self-auto">
                        <History size={14} />
                        Active Cases
                    </div>
                )}
            </div>

            {user.role === 'Seller' && (
                <div className="flex flex-wrap gap-2 border-b border-stone-100 pb-2">
                    {[
                        { id: 'pending', label: 'Action Required', count: refunds.filter(r => r.status === 'Pending').length, color: 'text-amber-600' },
                        { id: 'transit', label: 'In Progress', count: refunds.filter(r => ['Disputed_By_Seller', 'Return_Pending', 'In_Return_Transit', 'Returned'].includes(r.status)).length, color: 'text-blue-600' },
                        { id: 'closed', label: 'Resolved', count: refunds.filter(r => ['Refunded', 'Rejected'].includes(r.status)).length, color: 'text-stone-500' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-4 sm:px-6 text-xs font-black uppercase tracking-widest transition-all relative shrink-0 ${activeTab === tab.id ? `${tab.color} border-b-2 border-current` : 'text-stone-300 hover:text-stone-500'}`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === tab.id ? 'bg-current text-white' : 'bg-stone-100 text-stone-400'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {user.role === 'Seller' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRefunds.length === 0 ? (
                        <div className="col-span-full py-20 bg-white rounded-[2.5rem] border border-stone-100 border-dashed flex flex-col items-center justify-center text-stone-300">
                            <Layers size={48} className="mb-4 opacity-50" />
                            <p className="font-bold uppercase tracking-widest text-[10px]">No {activeTab} cases recorded</p>
                        </div>
                    ) : (
                        filteredRefunds.map(refund => (
                            <RefundActionCard key={refund._id} request={refund} onAction={fetchRefunds} />
                        ))
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-black/[0.02] overflow-hidden">
                    {refunds.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-stone-50 rounded-[2rem] flex items-center justify-center text-stone-200 mb-6">
                                <Clock size={36} />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900">No History Found</h3>
                            <p className="text-stone-500 max-w-xs mx-auto mt-2">Any refund requests you create will appear here for tracking.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-50">
                            {refunds.map(refund => (
                                <div key={refund._id} className="p-8 hover:bg-stone-50/50 transition-all group">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div className="flex items-start gap-6">
                                            <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300 group-hover:text-stone-900 transition-colors shrink-0">
                                                <Package size={24} />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Order Ticket</span>
                                                    <span className="text-sm font-black text-neutral-900">#{refund.order?._id.slice(-8).toUpperCase()}</span>
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${getStatusStyle(refund.status)}`}>
                                                        {refund.status.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-stone-500 font-medium italic border-l-2 border-stone-100 pl-4 py-1">"{refund.customerMessage}"</p>
                                                <div className="flex items-center gap-6 mt-3 text-[10px] font-black text-stone-300 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(refund.createdAt).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}</span>
                                                    {refund.images?.length > 0 && <span className="flex items-center gap-1.5 text-stone-500"><ImageIcon size={12} /> {refund.images.length} Evidence Docs</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 self-end md:self-center">
                                            <Link
                                                to={user.role === 'Customer' ? `/refunds/${refund._id}` : '/support/tickets'}
                                                className="h-12 px-6 bg-white border border-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all flex items-center gap-2 shadow-lg shadow-black/[0.02]"
                                            >
                                                Detailed View <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
