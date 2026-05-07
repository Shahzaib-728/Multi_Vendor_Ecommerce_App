import { X, User, Store, Truck, CreditCard, Package, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function UnifiedView({ data, onClose }) {
    if (!data) return null;

    const { order, user, seller } = data;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Unified Lookup View</h2>
                        <p className="text-slate-500 text-sm">Read-only "God Mode" view of platform entities.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto p-8 bg-slate-50/50">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* LEFT COLUMN: Entity Details */}
                        <div className="space-y-8">
                            {/* User Section */}
                            {(user || order?.customer) && (
                                <section className="bg-white p-6 rounded-2xl border shadow-sm">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><User size={20} className="text-blue-500" /> Customer Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center pb-2 border-b">
                                            <span className="text-slate-500 text-sm">Full Name</span>
                                            <span className="font-semibold">{(user || order.customer).name}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b">
                                            <span className="text-slate-500 text-sm">Email Address</span>
                                            <span className="font-semibold">{(user || order.customer).email}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b">
                                            <span className="text-slate-500 text-sm">Role</span>
                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase">{(user || order.customer).role || 'Customer'}</span>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Seller Section */}
                            {(seller || order?.seller) && (
                                <section className="bg-white p-6 rounded-2xl border shadow-sm">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Store size={20} className="text-emerald-500" /> Seller Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center pb-2 border-b">
                                            <span className="text-slate-500 text-sm">Store Name</span>
                                            <span className="font-semibold">{(seller || order.seller).sellerDetails?.storeName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b">
                                            <span className="text-slate-500 text-sm">Owner Name</span>
                                            <span className="font-semibold">{(seller || order.seller).name}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b">
                                            <span className="text-slate-500 text-sm">Business Contact</span>
                                            <span className="font-semibold">{(seller || order.seller).sellerDetails?.businessPhone || 'N/A'}</span>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Order Details */}
                        <div className="space-y-8">
                            {order ? (
                                <section className="bg-white p-6 rounded-2xl border shadow-sm h-full">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900"><Package size={20} className="text-orange-500" /> Order #{order._id.slice(-6).toUpperCase()}</h3>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Status</div>
                                            <div className="font-bold text-sm">{order.orderStatus}</div>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Payment</div>
                                            <div className="font-bold text-sm text-green-600">{order.paymentStatus}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="font-bold text-sm border-b pb-2">Order Items</div>
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex gap-3 items-center">
                                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center text-slate-400 overflow-hidden">
                                                    {item.product?.image ? <img src={item.product.image} className="w-full h-full object-cover" /> : <Package size={20} />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-semibold">{item.product?.name || 'Unknown Product'}</div>
                                                    <div className="text-xs text-slate-500">Qty: {item.quantity} × {formatCurrency(item.price)}</div>
                                                </div>
                                                <div className="text-sm font-bold">{formatCurrency(item.quantity * item.price)}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-6 border-t space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 text-sm">Delivery Address</span>
                                            <span className="text-xs text-right max-w-[200px] font-medium">
                                                {order.shippingAddress?.street}, {order.shippingAddress?.city}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-lg font-bold pt-2">
                                            <span>Total Paid</span>
                                            <span className="text-black">{formatCurrency(order.totalAmount)}</span>
                                        </div>
                                    </div>
                                </section>
                            ) : (
                                <div className="bg-slate-50 border-2 border-dashed rounded-3xl h-full flex flex-col items-center justify-center p-12 text-slate-400">
                                    <Search size={48} className="mb-4 opacity-20" />
                                    <p className="text-center font-medium">No order associated with this search.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Search = ({ size, className }) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
