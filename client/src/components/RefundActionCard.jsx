import { useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

export default function RefundActionCard({ request, onAction }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [defense, setDefense] = useState('');
    const [showEscalateForm, setShowEscalateForm] = useState(false);

    const handleApprove = async () => {
        if (!window.confirm('Are you sure you want to approve this refund? This will instantly debit your wallet.')) return;

        setLoading(true);
        try {
            await api.patch(`/refunds/${request._id}/approve`);
            onAction();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to approve refund');
        } finally {
            setLoading(false);
        }
    };

    const handleEscalate = async () => {
        if (!defense) return alert('Please provide a defense message for support.');

        setLoading(true);
        try {
            await api.patch(`/refunds/${request._id}/escalate`, {
                sellerDefense: defense
            });
            onAction();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to escalate');
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

    return (
        <div className="bg-white border border-stone-100 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-black/[0.04] transition-all group flex flex-col h-full">
            <div className="p-6 flex flex-wrap items-center justify-between gap-4 bg-stone-50/50 border-b border-stone-50">
                <div className="flex items-center gap-4">
                    <div className="bg-rose-50 p-2.5 rounded-2xl text-rose-500 group-hover:rotate-12 transition-transform">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-stone-300 uppercase tracking-widest leading-none mb-1">Order Ref</div>
                        <div className="font-black text-neutral-900 group-hover:text-stone-600 transition-colors">
                            #{request.order?._id.slice(-8).toUpperCase()}
                        </div>
                    </div>
                </div>
                <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${getStatusStyle(request.status)}`}>
                    {request.status.replace(/_/g, ' ')}
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col space-y-6">
                <div className="flex-1">
                    <div className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-3 flex justify-between items-center">
                        Complaint
                        {request.images && request.images.length > 0 && (
                            <span className="flex items-center gap-1 text-stone-900 lowercase font-medium italic"><ImageIcon size={10} /> {request.images.length} proofs</span>
                        )}
                    </div>
                    <div className="text-sm text-stone-600 bg-stone-50/50 p-4 rounded-2xl border border-stone-50 italic leading-relaxed">
                        "{request.customerMessage}"
                    </div>
                </div>

                {request.images && request.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {request.images.map((img, i) => (
                            <div key={i} className="relative group/img shrink-0">
                                <img
                                    src={img}
                                    alt="Proof"
                                    className="w-16 h-16 object-cover rounded-xl border-2 border-transparent hover:border-neutral-900 cursor-pointer transition-all shadow-sm"
                                    onClick={() => window.open(img, '_blank')}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {request.status === 'Pending' && !showEscalateForm && (
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleApprove}
                            disabled={loading}
                            className="flex-1 h-12 flex items-center justify-center gap-2 bg-neutral-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50 active:scale-95"
                        >
                            <CheckCircle size={14} /> Accept
                        </button>
                        <button
                            onClick={() => setShowEscalateForm(true)}
                            disabled={loading}
                            className="flex-1 h-12 flex items-center justify-center gap-2 bg-white text-rose-600 border border-rose-100 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 transition-all disabled:opacity-50 active:scale-95"
                        >
                            <ShieldAlert size={14} /> Dispute
                        </button>
                    </div>
                )}

                {showEscalateForm && (
                    <div className="space-y-4 animate-in mt-2 fade-in slide-in-from-top-2">
                        <textarea
                            value={defense}
                            onChange={(e) => setDefense(e.target.value)}
                            className="w-full p-4 border border-stone-100 rounded-2xl text-sm focus:ring-1 focus:ring-black outline-none resize-none h-24 bg-stone-50/50 font-medium placeholder:text-stone-300"
                            placeholder="Explain why this refund should be rejected..."
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEscalateForm(false)}
                                className="flex-1 py-3 text-stone-400 font-black uppercase tracking-widest text-[10px] hover:text-stone-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEscalate}
                                disabled={loading}
                                className="px-8 py-3 bg-stone-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black shadow-xl shadow-black/10 transition-all"
                            >
                                {loading ? '...' : 'Launch Dispute'}
                            </button>
                        </div>
                    </div>
                )}

                {request.status === 'Disputed_By_Seller' && request.sellerDefense && (
                    <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl">
                        <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-1.5 leading-none">
                            <ShieldAlert size={12} /> Launch Case Defense
                        </div>
                        <div className="text-xs text-orange-800 italic leading-relaxed font-medium">"{request.sellerDefense}"</div>
                    </div>
                )}
            </div>
        </div>
    );
}
