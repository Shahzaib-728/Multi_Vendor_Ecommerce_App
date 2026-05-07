import { useState } from 'react';
import { X, ShieldAlert, CheckCircle, Scale, Image as ImageIcon, MessageSquare, ShieldCheck, Ban } from 'lucide-react';
import api from '../../../services/api';

export default function DisputeConsole({ dispute, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);

    const handleResolve = async (decision) => {
        if (!window.confirm(`Are you sure you want to ${decision === 'Refund' ? 'FORCE REFUND' : 'REJECT CLAIM'}? this action is irreversible.`)) return;

        setLoading(true);
        try {
            await api.patch(`/refunds/${dispute._id}/resolve`, {
                decision: decision
            });
            onSuccess();
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to resolve dispute');
        } finally {
            setLoading(false);
        }
    };

    if (!dispute) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
                <div className="p-5 border-b flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                            <Scale size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-2xl font-bold text-slate-900">Dispute Control Center</h2>
                            <p className="text-slate-500 text-xs md:text-sm italic">Reviewing Order #{dispute.order?._id.slice(-6).toUpperCase()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">
                    {/* LEFT: Customer Side */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/30">
                        <h3 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2">
                            Customer's Claim
                        </h3>

                        <div className="bg-white p-6 rounded-2xl border shadow-sm mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 uppercase">
                                    {dispute.customer?.name?.[0]}
                                </div>
                                <div className="font-bold text-slate-900">{dispute.customer?.name}</div>
                            </div>
                            <div className="text-base md:text-lg text-slate-700 leading-relaxed font-medium italic">
                                "{dispute.customerMessage}"
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm"><ImageIcon size={16} className="text-slate-400" /> Uploaded Proof</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {dispute.images?.map((img, i) => (
                                    <div key={i} className="group relative aspect-video rounded-xl border overflow-hidden bg-slate-100 cursor-zoom-in shadow-sm hover:shadow-md transition-all" onClick={() => window.open(img, '_blank')}>
                                        <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Customer Proof" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">

                                        </div>
                                    </div>
                                ))}
                                {(!dispute.images || dispute.images.length === 0) && (
                                    <div className="col-span-2 p-6 text-center text-slate-400 border-2 border-dashed rounded-xl text-xs">
                                        No image proof provided.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Seller Side */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/30">
                        <h3 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2">
                            Seller's Defense
                        </h3>

                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 uppercase">
                                    {dispute.seller?.name?.[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">{dispute.seller?.sellerDetails?.storeName || 'Store'}</div>
                                    <div className="text-xs text-slate-400">{dispute.seller?.name}</div>
                                </div>
                            </div>
                            <div className="text-base md:text-lg text-slate-700 leading-relaxed font-medium italic">
                                "{dispute.sellerDefense || "The seller has not provided a detailed defense message yet, or only flagged for escalations."}"
                            </div>
                        </div>

                        <div className="mt-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-sm"><ShieldAlert size={16} /> Dispute Context</h4>
                            <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
                                Review the images on the left against the seller's claim above.
                                A <b>Force Refund</b> will debit the seller's wallet immediately.
                                A <b>Reject Claim</b> will finalize the funds for the seller and close the ticket permanently.
                            </p>
                        </div>
                    </div>
                </div>

                {/* BOTTOM: Actions */}
                <div className="p-6 border-t bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-xs md:text-sm text-slate-500 w-full md:w-auto text-center md:text-left">
                        Dispute ID: <span className="font-mono text-slate-900 block md:inline">{dispute._id}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                        <button
                            onClick={() => handleResolve('Reject')}
                            disabled={loading}
                            className="px-6 py-3.5 bg-white border-2 border-slate-200 text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 shadow-sm w-full sm:w-auto text-sm"
                        >
                            <Ban size={18} /> Reject Claim
                        </button>
                        <button
                            onClick={() => handleResolve('Refund')}
                            disabled={loading}
                            className="px-6 py-3.5 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-black/20 w-full sm:w-auto text-sm"
                        >
                            <ShieldCheck size={18} /> Force Refund
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
