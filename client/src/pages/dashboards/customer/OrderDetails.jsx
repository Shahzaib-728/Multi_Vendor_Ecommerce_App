import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useOrderStore } from '../../../store/orders'
import { MapPin, Package, CreditCard, ChevronLeft, Truck, AlertCircle, Wallet } from 'lucide-react'
import { formatCurrency } from '../../../utils/format'
import RefundModal from '../../../components/RefundModal'

export default function OrderDetails() {
  const { id } = useParams()
  const fetchOrder = useOrderStore(s => s.fetchOrder)
  const currentOrder = useOrderStore(s => s.currentOrder)
  const loading = useOrderStore(s => s.loading)
  const error = useOrderStore(s => s.error)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)

  useEffect(() => {
    if (id) fetchOrder(id)
  }, [id])

  if (loading) return <div className="p-8 text-center">Loading order details...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>
  if (!currentOrder) return <div className="p-8 text-center">Order not found</div>

  const { items, totalAmount, shippingAddress, orderStatus, createdAt, _id, shippingFee } = currentOrder

  const isCancelled = orderStatus === 'Cancelled'

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/orders" className="flex items-center gap-2 text-sm text-slate-500 hover:text-black mb-6">
        <ChevronLeft size={16} /> Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            Order #{_id}
            {isCancelled && <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">Cancelled</span>}
            {orderStatus === 'Refunded' && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded border border-orange-200">Refunded</span>}
          </h1>
          <div className="text-slate-500 text-sm mt-1">
            Placed on {new Date(createdAt).toLocaleDateString()} at {new Date(createdAt).toLocaleTimeString()}
          </div>
          {orderStatus === 'Refunded' && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-800 animate-in fade-in slide-in-from-top-2">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                <Wallet size={20} />
              </div>
              <div>
                <div className="font-bold text-sm">Refund Successful!</div>
                <div className="text-xs">The full amount has been credited to your <Link to="/wallet" className="underline font-bold hover:text-emerald-900">Urban Edge Wallet</Link>.</div>
              </div>
            </div>
          )}
        </div>

        {orderStatus === 'Delivered' && (
          <button
            onClick={() => setIsRefundModalOpen(true)}
            className="px-6 py-2 border-2 border-black rounded-full font-bold hover:bg-black hover:text-white transition-all text-sm"
          >
            Request Refund
          </button>
        )}
      </div>

      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        order={currentOrder}
        onSuccess={() => {
          fetchOrder(id);
          alert('Refund request submitted successfully!');
        }}
      />

      {/* Tracking Timeline (Vertical Stepper) */}
      {
        !isCancelled && (
          <div className="bg-white border p-6 rounded-xl mb-8">
            <h3 className="font-semibold mb-6">Delivery Timeline</h3>

            <div className="space-y-0 pl-2">
              {[
                { status: 'Placed', label: 'Order Placed', code: 100 },
                { status: 'Ready for Pickup', label: 'Ready for Pickup', code: 150 },
                { status: 'Picked Up', label: 'Picked up by Courier', code: 200 },
                { status: 'In Transit Hub', label: 'Arrived at Transit Hub', code: 300 },
                { status: 'In Transit', label: 'In Transit', code: 400 },
                { status: 'Destination Hub', label: 'Arrived at Destination Hub', code: 500 },
                { status: 'Out for Delivery', label: 'Out for Delivery', code: 600 },
                { status: 'Delivered', label: 'Delivered', code: 700 }, // Final Step
              ].map((step, index, arr) => {
                // Check if this step is completed or active
                const timelineEntry = currentOrder.trackingTimeline?.find(t => t.status === step.status);

                // Simple logic: If we have a timeline entry, it's done/active.
                // Or we can rely on index vs current status index.

                // Let's use the timeline entry for "Checked" state + Timestamp
                // And check global orderStatus for "Current Active" highlighting

                const isCompleted = !!timelineEntry;
                const isActive = currentOrder.orderStatus === step.status;
                const isLast = index === arr.length - 1;

                return (
                  <div key={step.code} className="relative flex gap-4 pb-8 last:pb-0">
                    {/* Vertical Line */}
                    {!isLast && (
                      <div className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${isCompleted ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                    )}

                    {/* Icon / Dot */}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors shrink-0
                                ${isActive ? 'bg-green-100 border-green-500 text-green-600 animate-pulse' :
                        isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-200 text-slate-300'}
                            `}>
                      {isCompleted ? <div className="w-2.5 h-2.5 bg-current rounded-full" /> : <div className="w-2 h-2 bg-current rounded-full" />}
                    </div>

                    {/* Content */}
                    <div className={`${isCompleted || isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                      <h4 className="font-semibold text-sm">{step.label}</h4>
                      {timelineEntry && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {new Date(timelineEntry.timestamp).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, month: 'short', day: 'numeric' })}
                          {timelineEntry.location && timelineEntry.location !== 'Online' && (
                            <span className="ml-2 px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{timelineEntry.location}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="p-4 border-b bg-slate-50 font-semibold">Items</div>
            <div>
              {items.map((item, i) => (
                <div key={i} className="p-4 flex gap-4 border-b last:border-0">
                  <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center text-slate-400 overflow-hidden">
                    {item.product?.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.product?.name || 'Unknown Product'}</div>
                    <div className="text-sm text-slate-500">Qty: {item.quantity} × {formatCurrency(item.price)}</div>
                  </div>
                  <div className="font-bold">{formatCurrency(item.quantity * item.price)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          {/* Shipping */}
          <div className="bg-white border rounded-xl p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><MapPin size={18} className="text-primary" /> Delivery Address</h3>
            <div className="text-sm text-slate-600 space-y-1">
              <div className="font-medium text-black">{shippingAddress?.receiverName}</div>
              <div>{shippingAddress?.phone}</div>
              <div>{shippingAddress?.street}, {shippingAddress?.area}</div>
              <div>{shippingAddress?.city}, {shippingAddress?.province}</div>
              <div>{shippingAddress?.zipCode}, {shippingAddress?.country}</div>
            </div>
          </div>

          {/* Information */}
          <div className="bg-white border rounded-xl p-4 space-y-4">
            {currentOrder.deliveryPartner && (
              <div className="pb-4 border-b">
                <h3 className="font-semibold mb-2 flex items-center gap-2"><Truck size={18} className="text-primary" /> Delivery Partner</h3>
                <div className="text-sm font-medium">{currentOrder.deliveryPartner.name}</div>
                <div className="text-xs text-slate-500">{currentOrder.deliveryPartner.email}</div>
              </div>
            )}

            <div className="pb-4 border-b">
              <h3 className="font-semibold mb-2 flex items-center gap-2"><CreditCard size={18} className="text-primary" /> Payment Info</h3>
              <div className="text-sm">
                <span className="text-slate-500">Method:</span> <span className="font-medium capitalize">{currentOrder.paymentMethod || 'Card'}</span>
              </div>
              <div className="text-sm mt-1">
                <span className="text-slate-500">Status:</span>
                <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded ${currentOrder.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {currentOrder.paymentStatus || 'Pending'}
                </span>
              </div>
            </div>

            {/* Total */}
            <div>
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span>{formatCurrency(totalAmount - (shippingFee || 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipping</span>
                  <span>{formatCurrency(shippingFee || 0)}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}

