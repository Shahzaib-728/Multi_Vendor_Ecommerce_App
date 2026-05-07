import { useState, useEffect } from 'react'
import { MapPin, Phone, Package, Truck, CheckCircle, Navigation, ChevronDown, ListFilter, Calendar } from 'lucide-react'
import { getAssignedOrders, updateDeliveryStatus } from '../../../services/delivery'
import { useUIStore } from '../../../store/ui'
import SelectMenu from '../../../components/SelectMenu'

export default function AssignedOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusInput, setStatusInput] = useState({})
  const [filter, setFilter] = useState('Active')
  const pushToast = useUIStore(s => s.pushToast)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const data = await getAssignedOrders()
      setOrders(data)
    } catch (err) {
      console.error(err)
      pushToast({ type: 'error', message: 'Failed to fetch assigned orders' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id) => {
    const newStatus = statusInput[id]
    if (!newStatus) return

    try {
      await updateDeliveryStatus(id, newStatus)
      pushToast({ type: 'success', message: `Status updated to ${newStatus}` })
      fetchOrders()
      setStatusInput(prev => ({ ...prev, [id]: '' }))
    } catch (err) {
      pushToast({ type: 'error', message: 'Status update failed' })
    }
  }

  const getStatusBadgeStyle = (status) => {
    if (status === 'Delivered' || status === 'Returned') return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    if (status === 'Delivery Failed') return 'bg-rose-50 text-rose-600 border-rose-100'
    return 'bg-blue-50 text-blue-600 border-blue-100'
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'All') return true
    if (filter === 'Active') return !['Delivered', 'Returned', 'Delivery Failed'].includes(order.orderStatus)
    if (filter === 'Packed') return order.orderStatus === 'Packed' || order.orderStatus === 'Ready for Pickup'
    if (filter === 'Picked Up') return order.orderStatus === 'Picked Up'
    if (filter === 'In Transit') return order.orderStatus === 'In Transit' || order.orderStatus === 'In Transit Hub'
    if (filter === 'Out for Delivery') return order.orderStatus === 'Out for Delivery'
    if (filter === 'Delivered') return order.orderStatus === 'Delivered'
    if (filter === 'Delivery Failed') return order.orderStatus === 'Delivery Failed'
    if (filter === 'Returns') return order.orderStatus.includes('Return') || order.orderStatus === 'Returned'
    return true
  })

  // Options for main filter
  const filterOptions = [
    { value: "Active", label: "Active Orders" },
    { value: "Packed", label: "Ready for Pickup" },
    { value: "Picked Up", label: "Picked Up" },
    { value: "In Transit", label: "In Transit" },
    { value: "Out for Delivery", label: "Out for Delivery" },
    { value: "Delivered", label: "Delivered" },
    { value: "Delivery Failed", label: "Failed Missions" },
    { value: "Returns", label: "Return Operations" },
    { value: "All", label: "Complete Ledger" }
  ]

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
      <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Syncing Logistics Console...</p>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-neutral-900">Task Assignments</h1>
          <p className="text-stone-500 font-medium tracking-tight text-sm md:text-base">Track and fulfill your active logistics operations.</p>
        </div>

        <div className="w-full md:w-64">
          <SelectMenu
            label="Filter View"
            options={filterOptions}
            selected={filter}
            onChange={setFilter}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.map(order => {
          const pickupSeller = order.items?.[0]?.seller || {}
          const shipping = order.shippingAddress || {}
          const currentInput = statusInput[order._id] || ''

          const addressStr = [shipping.street, shipping.city, shipping.province, shipping.zipCode]
            .filter(Boolean)
            .join(', ')

          // Options for individual order status
          const statusOptions = order.orderStatus.includes('Return') ? [
            { value: "Picking Up (Return)", label: "Perform Return-Pickup" },
            { value: "Returned", label: "Seal as Returned" },
            { value: "Delivery Failed", label: "Abort: Return Failed" }
          ] : [
            { value: "Picked Up", label: "Confirm Pickup" },
            { value: "In Transit", label: "Update: In Transit" },
            { value: "Out for Delivery", label: "Deploy: Out for Delivery" },
            { value: "Delivered", label: "Finalize: Delivered" },
            { value: "Delivery Failed", label: "Report: Delivery Failed" }
          ]

          return (
            <div key={order._id} className="bg-white rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-black/[0.02] overflow-hidden hover:shadow-black/[0.04] transition-all group">
              {/* Header */}
              <div className="px-6 md:px-8 py-5 border-b border-stone-50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-stone-50/50">
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest leading-none mb-1">Order Hash</span>
                    <span className="text-sm font-black text-neutral-900">#{(order._id).slice(-8).toUpperCase()}</span>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusBadgeStyle(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-stone-100 w-full md:w-auto">
                  <div className="w-8 h-8 bg-stone-50 rounded-xl flex items-center justify-center text-stone-900 shrink-0"><Phone size={14} /></div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest leading-none mb-1">Direct Contact</span>
                    <span className="text-xs font-black text-neutral-900 italic tracking-tight truncate">{order.customer?.phoneNumber || shipping.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                {/* Route Info */}
                <div className="space-y-10 relative pl-8 border-l-2 border-dashed border-stone-100 py-2">
                  <div className="relative">
                    <div className="absolute -left-10 top-1 w-4 h-4 rounded-full bg-stone-100 border-4 border-white shadow-sm"></div>
                    <div>
                      <h4 className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-2">Primary Collection</h4>
                      <p className="text-sm md:text-base font-black text-neutral-900 tracking-tight">
                        {order.orderStatus.includes('Return') ? order.customer?.name : (pickupSeller.name || 'Store Central')}
                      </p>
                      <p className="text-xs md:text-sm text-stone-500 font-medium mt-1 leading-relaxed">
                        {order.orderStatus.includes('Return') ? addressStr : 'Managed Warehouse Distribution Center (Local)'}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-10 top-1 w-4 h-4 rounded-full bg-neutral-900 border-4 border-white shadow-lg"></div>
                    <div>
                      <h4 className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-2">Final Destination</h4>
                      <p className="text-sm md:text-base font-black text-neutral-900 tracking-tight">
                        {order.orderStatus.includes('Return') ? 'Reverse Logistics Hub' : order.customer?.name}
                      </p>
                      <p className="text-xs md:text-sm text-stone-500 font-medium mt-1 leading-relaxed">
                        {order.orderStatus.includes('Return') ? 'Centralized Returns Processing Department' : addressStr}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Update & Items */}
                <div className="flex flex-col gap-6">
                  <div className="bg-stone-50/50 rounded-3xl p-5 md:p-6 border border-stone-100 space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Protocol Update</label>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400"><Calendar size={12} /> Live Tracking</div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <SelectMenu
                        placeholder="Choose Instruction"
                        options={statusOptions}
                        selected={currentInput}
                        onChange={(val) => setStatusInput(prev => ({ ...prev, [order._id]: val }))}
                      />
                      <button
                        onClick={() => handleUpdateStatus(order._id)}
                        disabled={!currentInput}
                        className="w-full h-12 bg-neutral-900 text-white px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black disabled:opacity-20 active:scale-95 transition-all shadow-xl shadow-black/10"
                      >
                        Confirm Status Update
                      </button>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-white border border-stone-50 rounded-3xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-2">Cargo Manifest</p>
                      <div className="flex flex-wrap gap-2">
                        {order.items?.map((item, i) => (
                          <div key={i} className="w-12 h-12 rounded-xl border border-stone-50 bg-stone-50 p-1 overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                            {item.product?.image ? (
                              <img src={item.product?.image} className="w-full h-full object-cover rounded-lg" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-300"><Package size={18} /></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">Units</p>
                      <p className="text-xl font-black text-neutral-900">{order.items?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {filteredOrders.length === 0 && (
          <div className="py-24 text-center space-y-4 bg-stone-50/50 rounded-[3rem] border border-dashed border-stone-200">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-black/[0.02] text-stone-200">
              <Truck size={36} />
            </div>
            <div className="max-w-xs mx-auto">
              <p className="text-lg font-black text-neutral-900 tracking-tight">No Active Missions</p>
              <p className="text-xs text-stone-500 font-medium">Clear your filters or wait for the logistics grid to update with new assignments.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
