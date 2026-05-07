import { useState } from 'react'
import { updateDeliveryStatus } from '../../../services/delivery'
import { useUIStore } from '../../../store/ui'
import { Package, CheckCircle, Clock, AlertCircle, Save } from 'lucide-react'
import { validateField } from '../../../utils/validation'

export default function UpdateStatus() {
  const [id, setId] = useState('')
  const [status, setStatus] = useState('Delivered')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [idError, setIdError] = useState(null)
  const push = useUIStore(s => s.pushToast)

  const submit = async (e) => {
    e.preventDefault()
    const err = validateField('orderId', id)
    if (err) {
      setIdError(err)
      setError('Please fix the errors above')
      return
    }
    setLoading(true)
    setError('')
    try {
      const r = await updateDeliveryStatus(id, status)
      if (r?.success) {
        push({ type: 'success', message: 'Order status updated successfully' })
        setId('')
      } else {
        setError(r?.error || 'Update failed')
      }
    } catch (e) {
      setError('Update failed. Please check the Order ID.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
            <Package size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Update Status</h1>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Order ID</label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={id}
                onChange={e => {
                  const v = e.target.value
                  setId(v)
                  setIdError(validateField('orderId', v))
                }}
                placeholder="e.g. ORD-12345"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${idError ? 'border-red-500' : ''}`}
                required
              />
            </div>
            {idError && (
              <p className="text-[10px] text-red-500 ml-1 flex items-center gap-1">
                <AlertCircle size={10} /> {idError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">New Status</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-between ${status === s ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                >
                  {s}
                  {status === s && <CheckCircle size={14} />}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Save Status</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
