import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/auth';
import {
    AlertCircle, Clock, CheckCircle, ShieldAlert,
    ChevronLeft, Package, Image as ImageIcon,
    MessageSquare, User, Store, Wallet,
    Truck
} from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

export default function CustomerRefundDetails() {
    const { id } = useParams();
    const user = useAuthStore(s => s.user);
    const [refund, setRefund] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRefundDetails();
    }, [id]);

    const fetchRefundDetails = async () => {
        try {
            const { data } = await api.get(`/refunds/${id}`);
            setRefund(data);
        } catch (err) {
            console.error('Failed to fetch refund details', err);
            setError(err.response?.data?.message || 'Failed to load refund details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Return_Pending':
            case 'In_Return_Transit': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Returned':
            case 'Refunded': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Loading refund details...</div>;
    if (error) return (
        <div className="p-10 text-center">
            <div className="text-red-500 font-bold mb-4">{error}</div>
            <Link to="/refunds" className="text-primary hover:underline font-bold">Back to Refunds</Link>
        </div>
    );
    if (!refund) return <div className="p-10 text-center text-slate-500">Refund request not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <Link to="/refunds" className="flex items-center gap-2 text-sm text-slate-500 hover:text-black mb-6">
                <ChevronLeft size={16} /> Back to Refunds
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        Refund for Order #{refund.order?._id.slice(-6).toUpperCase()}
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase ${getStatusStyle(refund.status)}`}>
                            {refund.status.replace(/_/g, ' ')}
                        </span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Request placed on {new Date(refund.createdAt).toLocaleDateString()}</p>
                </div>
                <Link
                    to={`/orders/${refund.order?._id}`}
                    className="px-6 py-2 bg-black text-white rounded-full font-bold text-sm h-fit hover:bg-slate-800 transition-colors"
                >
                    View Original Order
                </Link>
            </div>

            {refund.status === 'Return_Pending' && (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-center gap-5 text-blue-800">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                        <Package size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Return Approved!</h3>
                        <p className="text-sm opacity-90 italic">Please keep the product ready. A delivery partner will arrive at your address to pick it up and return it to our warehouse.</p>
                    </div>
                </div>
            )}

            {refund.status === 'In_Return_Transit' && (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-center gap-5 text-blue-800">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                        <Truck size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">In Return Transit</h3>
                        <p className="text-sm opacity-90 italic">The item has been picked up and is on its way back to our warehouse. Your refund will be processed automatically once it arrives.</p>
                    </div>
                </div>
            )}

            {refund.status === 'Refunded' && (
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-center gap-5 text-emerald-800">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Refund Completed</h3>
                        <p className="text-sm opacity-90 italic">Your refund was provided in cash by our delivery partner upon pickup. This case is now resolved.</p>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Left Side: Communication */}
                <div className="space-y-6">
                    {/* Customer Message */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                            <MessageSquare size={18} className="text-primary" /> Your Message
                        </h3>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-slate-700">
                            "{refund.customerMessage}"
                        </div>
                        {refund.images?.length > 0 && (
                            <div className="pt-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Supporting Proofs</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {refund.images.map((img, i) => (
                                        <a href={img} target="_blank" key={i} className="aspect-square rounded-lg border overflow-hidden hover:opacity-80 transition-opacity">
                                            <img src={img} className="w-full h-full object-cover" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Items List (New - Matching OrderDetails) */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-slate-50 font-bold text-sm uppercase tracking-wider text-slate-500">Items to Return</div>
                        <div className="divide-y divide-slate-100">
                            {refund.order?.items?.map((item, i) => (
                                <div key={i} className="p-4 flex gap-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden shrink-0 border border-slate-100">
                                        {item.product?.image ? (
                                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package size={24} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-900">{item.product?.name || 'Unknown Product'}</div>
                                        <div className="text-sm text-slate-500">Qty: {item.quantity} × {formatCurrency(item.price)}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-slate-900">{formatCurrency(item.quantity * item.price)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Seller Defense (If exists) */}
                    {(refund.status === 'Disputed_By_Seller' || refund.sellerDefense) && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 border-l-4 border-l-orange-400">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                                <Store size={18} className="text-orange-500" /> Seller's Response
                            </h3>
                            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 italic text-slate-700">
                                "{refund.sellerDefense || "The seller has disputed this claim and it is now under review by our support team."}"
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase">
                                <ShieldAlert size={14} /> Under Review by Support
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Timeline & Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                            <Clock size={18} className="text-primary" /> Case Status
                        </h3>
                        <div className="space-y-4 pt-2">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                    <CheckCircle size={16} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900">Request Submitted</p>
                                    <p className="text-xs text-slate-500">{new Date(refund.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {refund.status !== 'Pending' && (
                                <div className="flex gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${['Refunded', 'Approved_By_Seller'].includes(refund.status) ? 'bg-green-500' :
                                        refund.status === 'Disputed_By_Seller' ? 'bg-orange-500' : 'bg-red-500'
                                        }`}>
                                        {['Refunded', 'Approved_By_Seller'].includes(refund.status) ? <CheckCircle size={16} className="text-white" /> :
                                            refund.status === 'Disputed_By_Seller' ? <Clock size={16} className="text-white" /> :
                                                <AlertCircle size={16} className="text-white" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">
                                            {refund.status === 'Disputed_By_Seller' ? 'Escalated to Support' :
                                                refund.status === 'Refunded' ? 'Refund Processed' :
                                                    refund.status === 'Return_Pending' ? 'Return Authorized' :
                                                        refund.status === 'In_Return_Transit' ? 'In Return Transit' :
                                                            refund.status === 'Returned' ? 'Item Returned to Warehouse' :
                                                                refund.status === 'Rejected' ? 'Claim Rejected' : refund.status}
                                        </p>
                                        <p className="text-xs text-slate-500">{refund.resolvedAt && !['Return_Pending', 'In_Return_Transit'].includes(refund.status) ? new Date(refund.resolvedAt).toLocaleString() : 'Processing...'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2">Urban Edge Guarantee</h4>
                            <p className="text-sm font-medium leading-relaxed italic opacity-80">
                                "Our support team monitors all disputes. If the seller doesn't respond or disputes unfairly, we step in to ensure you get your money back."
                            </p>
                        </div>
                        <AlertCircle className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10 text-white rotate-12" />
                    </div>
                </div>
            </div>
        </div>
    );
}
