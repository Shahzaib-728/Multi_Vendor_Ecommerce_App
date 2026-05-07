import { CheckCircle, Clock, Truck, Package, AlertCircle, ShoppingBag, Hash, Calendar, Layers, ChevronRight } from 'lucide-react'
import api from '../../../services/api'
import { updateOrderStatus, getSellerOrders } from '../../../services/seller'
import { useUIStore } from '../../../store/ui'
import { useEffect, useState } from 'react'
import { formatCurrency } from '../../../utils/format'

export default function Orders() {
  const [orders, setOrders] = useState({ pending: [], approved: [], delivered: [] })
  const [loading, setLoading] = useState(true)
  const pushToast = useUIStore(s => s.pushToast)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await getSellerOrders()
      setOrders(data)
    } catch (err) {
      pushToast({ type: 'error', message: 'Failed to load orders' })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'Packed');
      pushToast({ type: 'success', message: 'Order marked as Packed' });
      fetchOrders();
    } catch (err) {
      pushToast({ type: 'error', message: 'Failed to update order status' });
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
      <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Syncing merchant data...</p>
    </div>
  )

  const OrderSection = ({ orders, title, icon: Icon, colorClass, showAction }) => (
    <div className="space-y-4 mb-12">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-${colorClass}-50 text-${colorClass}-600`}>
            <Icon size={18} />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-neutral-900">{title}</h2>
        </div>
        <span className="text-[10px] font-black bg-stone-100 text-stone-500 px-3 py-1 rounded-full uppercase tracking-widest">
          {orders?.length || 0} batches
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders?.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-stone-100 border-dashed p-12 flex flex-col items-center text-center text-stone-300">
            <Layers size={32} className="mb-3 opacity-50" />
            <p className="text-[10px] font-black uppercase tracking-widest">No orders in this phase</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id} className="bg-white border border-stone-100 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-black/[0.03] transition-all group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:text-stone-900 transition-colors shrink-0">
                    <Package size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Ref</span>
                      <span className="text-sm font-black text-neutral-900">#{(order._id || order.id).slice(-8).toUpperCase()}</span>
                      <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1.5 ml-2"><Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString('en-PK')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-600">{order.customer?.name}</span>
                      <span className="text-[10px] text-stone-300 font-medium truncate max-w-[150px]">— {order.customer?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-8 border-t lg:border-t-0 pt-4 lg:pt-0">
                  <div className="flex gap-2">
                    {order.items?.map((item, i) => (
                      <div key={i} className="w-10 h-10 rounded-xl border border-stone-50 bg-stone-50 overflow-hidden shadow-sm" title={item.product?.name}>
                        <img src={item.product?.image} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                  </div>
                  <div className="text-right min-w-[100px]">
                    <p className="text-[10px] font-black text-stone-300 uppercase underline decoration-stone-200 underline-offset-4 mb-1">Net Proceeds</p>
                    <p className="text-lg font-black text-neutral-900">
                      {formatCurrency(order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {showAction && (order.orderStatus === 'Placed' || order.orderStatus === 'Pending Approval') ? (
                      <button
                        onClick={() => handleApprove(order._id || order.id)}
                        className="bg-neutral-900 text-white px-8 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10 active:scale-95 flex items-center gap-2"
                      >
                        Launch Batch <ChevronRight size={14} />
                      </button>
                    ) : (
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${order.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        order.orderStatus === 'Refunded' ? 'bg-orange-50 text-orange-600 border-orange-100 animate-pulse' :
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                        {order.orderStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-neutral-900">Store Manifest</h1>
          <p className="text-stone-500 font-medium">Review and fulfill your store's global sales.</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-stone-100 rounded-2xl text-xs font-black uppercase tracking-widest text-stone-600">
          <ShoppingBag size={14} />
          Active Fulfillment
        </div>
      </div>

      <div className="space-y-2">
        <OrderSection
          title="New Arrivals"
          orders={orders.pending}
          icon={Clock}
          colorClass="blue"
          showAction={true}
        />

        <OrderSection
          title="In Transit"
          orders={orders.approved}
          icon={Truck}
          colorClass="amber"
          showAction={false}
        />

        <OrderSection
          title="Archived Batches"
          orders={orders.delivered}
          icon={CheckCircle}
          colorClass="emerald"
          showAction={false}
        />
      </div>
    </div>
  )
}
