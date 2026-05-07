import { useState } from 'react'
import { searchOrder } from '../../../services/delivery'
import { AlertCircle } from 'lucide-react'
import { validateField } from '../../../utils/validation'
export default function SearchOrder() {
  const [id, setId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [idError, setIdError] = useState(null)
  const search = async () => {
    const err = validateField('orderId', id)
    if (err) {
      setIdError(err)
      return
    }
    setLoading(true); setError(''); setResult(null)
    try{ const r = await searchOrder(id); setResult(r) } catch(e){ setError('Order not found') } finally { setLoading(false) }
  }
  return (
    <div className="grid gap-3">
      <h1 className="text-2xl font-bold">Search Order</h1>
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            value={id}
            onChange={e => {
              const v = e.target.value
              setId(v)
              setIdError(validateField('orderId', v))
            }}
            placeholder="Order ID"
            className={`w-full px-3 py-2 border rounded ${idError ? 'border-red-500' : ''}`}
          />
          {idError && (
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={10} /> {idError}
            </p>
          )}
        </div>
        <button onClick={search} className="bg-primary text-white px-4 py-2 rounded">Search</button>
      </div>
      {loading && <div className="animate-pulse h-20 bg-slate-100 rounded" />}
      {error && <div className="p-4 border rounded bg-red-50">{error}</div>}
      {result && <div className="border rounded p-4">Order {result.id} - {result.status}</div>}
    </div>
  )
}
