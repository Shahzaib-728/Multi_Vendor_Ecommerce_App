import { useEffect, useState } from 'react'
import { getPendingSellers, approveSeller } from '../../../services/admin'
export default function ApproveSellers() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(()=>{ (async()=>{ try{ const d=await getPendingSellers(); setItems(d) } catch(e){ setError('Failed to load') } finally { setLoading(false) } })() },[])
  const onApprove = async id => { try{ await approveSeller(id); setItems(items.filter(i=>i.id!==id)) } catch(e){ setError('Approve failed') } }
  if (loading) return <div className="grid gap-3"><h1 className="text-2xl font-bold">Approve Sellers</h1><div className="animate-pulse h-24 bg-slate-100 rounded" /></div>
  if (error) return <div className="grid gap-3"><h1 className="text-2xl font-bold">Approve Sellers</h1><div className="p-4 border rounded bg-red-50">{error}</div></div>
  if (!items.length) return <div className="grid gap-3"><h1 className="text-2xl font-bold">Approve Sellers</h1><div className="p-6 border rounded text-slate-500">No pending sellers</div></div>
  return (
    <div>
      <h1 className="text-2xl font-bold mb-3">Approve Sellers</h1>
      <div className="grid gap-3">
        {items.map(i=> (
          <div key={i.id} className="border rounded p-4 flex items-center justify-between">
            <div>{i.name}</div>
            <button onClick={()=>onApprove(i.id)} className="bg-primary text-white px-3 py-1 rounded">Approve</button>
          </div>
        ))}
      </div>
    </div>
  )
}
