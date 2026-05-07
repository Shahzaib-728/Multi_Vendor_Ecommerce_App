import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useOrderStore } from '../../../store/orders'
import { useAuthStore } from '../../../store/auth'
import { useUIStore } from '../../../store/ui'
import { Package, Clock, ChevronRight, Hash, Calendar, CreditCard, ShoppingBag, AlertCircle } from 'lucide-react'
import { formatCurrency } from '../../../utils/format'

export default function Orders() {
  const orders = useOrderStore(s => s.orders)
  const loading = useOrderStore(s => s.loading)
  const fetchOrders = useOrderStore(s => s.fetchOrders)

  useEffect(() => {
    fetchOrders()
  }, [])

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100'
      case 'Refunded': return 'bg-orange-50 text-orange-600 border-orange-100 animate-pulse'
      default: return 'bg-amber-50 text-amber-600 border-amber-100'
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-neutral-900">My Orders</h1>
          <p className="text-stone-500 font-medium">Track and manage your order history.</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-stone-100 rounded-2xl text-xs font-black uppercase tracking-widest text-stone-600">
          <ShoppingBag size={14} />
          {orders.length} Orders Total
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
          <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Retrieving manifest...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-stone-100 p-20 flex flex-col items-center text-center shadow-2xl shadow-black/[0.02]">
          <div className="w-20 h-20 bg-stone-50 rounded-[2rem] flex items-center justify-center text-stone-300 mb-6">
            <Package size={36} />
          </div>
          <h3 className="text-xl font-bold text-neutral-900">No Orders Found</h3>
          <p className="text-stone-500 max-w-xs mx-auto mt-2 mb-8">You haven't placed any orders yet. Explore our products to start shopping.</p>
          <Link to="/products" className="bg-neutral-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all active:scale-95">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          {orders.map(o => (
            <div key={o._id || o.id} className="bg-white border border-stone-100 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-black/[0.03] transition-all group relative">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:text-stone-900 transition-colors shrink-0">
                    <Package size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Order Reference</span>
                      <span className="text-sm font-black text-neutral-900">#{(o._id || o.id).slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-stone-500">
                      <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(o.createdAt || o.date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1.5"><CreditCard size={12} /> {o.paymentMethod || 'EasyPaisa'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-stone-300 uppercase underline decoration-stone-200 underline-offset-4 mb-1">Total Impact</p>
                    <p className="text-lg font-black text-neutral-900">{formatCurrency(o.totalAmount || o.total)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(o.orderStatus || o.status)}`}>
                      {o.orderStatus || o.status}
                    </span>
                    <Link
                      to={`/orders/${o._id || o.id}`}
                      className="w-10 h-10 bg-stone-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
