import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CreditCard, DollarSign, Package, ShoppingCart } from 'lucide-react'

// Mock Data specifically for profile view
const SELLER_DETAILS = {
    id: 1,
    name: 'Alice Wilson',
    email: 'alice@seller.com',
    storeName: 'Alice Wonders',
    logo: 'A',
    joined: 'January 12, 2024',
    status: 'Active',
    description: 'Premium home decor and handmade crafts.',
    stats: {
        totalSales: '$12,450',
        orders: 154,
        products: 24,
        platformFee: '$1,245.00',
        pendingPayout: '$450.00'
    },
    paymentMethods: [
        { type: 'Bank Transfer', details: 'Chase Bank **** 8899', isDefault: true },
        { type: 'PayPal', details: 'alice@seller.com', isDefault: false }
    ]
}

export default function AdminSellerProfile() {
    const { id } = useParams()
    // in a real app, fetch by ID. Here we just use the mock constant.
    const seller = SELLER_DETAILS

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Link to="/admin/sellers" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900">
                <ArrowLeft size={16} className="mr-1" /> Back to Sellers
            </Link>

            {/* Header Profile */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {seller.logo}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-slate-900">{seller.storeName}</h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                            {seller.status}
                        </span>
                    </div>
                    <p className="text-slate-500 mb-2">{seller.name} • {seller.email}</p>
                    <div className="text-xs text-slate-400">Merchant ID: #{id} • Joined {seller.joined}</div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-slate-500">Platform Profit</div>
                    <div className="text-2xl font-bold text-emerald-600">{seller.stats.platformFee}</div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Sales</div>
                    <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <DollarSign size={20} className="text-slate-400" />
                        {seller.stats.totalSales}
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Orders</div>
                    <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ShoppingCart size={20} className="text-slate-400" />
                        {seller.stats.orders}
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Products</div>
                    <div className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Package size={20} className="text-slate-400" />
                        {seller.stats.products}
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Pending Payout</div>
                    <div className="text-xl font-bold text-amber-600 flex items-center gap-2">
                        <DollarSign size={20} className="text-amber-500" />
                        {seller.stats.pendingPayout}
                    </div>
                </div>
            </div>

            {/* Payment & Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Methods */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <CreditCard size={20} className="text-slate-400" />
                        Accepted Payment Methods & Payout Info
                    </h3>
                    <div className="space-y-4">
                        {seller.paymentMethods.map((method, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-8 bg-slate-200 rounded flex items-center justify-center text-xs font-bold text-slate-600">
                                        {method.type === 'Bank Transfer' ? 'BANK' : 'PAYPAL'}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">{method.type}</div>
                                        <div className="text-sm text-slate-500">{method.details}</div>
                                    </div>
                                </div>
                                {method.isDefault && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">Default</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Description / Metadata */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Store Details</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        {seller.description}
                    </p>

                    <div className="space-y-3">
                        <div className="text-sm flex justify-between">
                            <span className="text-slate-500">Business Type</span>
                            <span className="font-medium text-slate-900">Individual</span>
                        </div>
                        <div className="text-sm flex justify-between">
                            <span className="text-slate-500">Tax ID</span>
                            <span className="font-medium text-slate-900">••• •• 884X</span>
                        </div>
                        <div className="text-sm flex justify-between">
                            <span className="text-slate-500">Location</span>
                            <span className="font-medium text-slate-900">New York, USA</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
