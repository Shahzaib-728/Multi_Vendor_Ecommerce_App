import { useUIStore } from '../store/ui'

export default function Toast() {
  const toasts = useUIStore(s => s.toasts)
  const remove = useUIStore(s => s.removeToast)
  return (
    <div className="fixed right-4 top-20 z-[9999] space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-2 rounded shadow bg-white border ${t.type === 'error' ? 'border-red-500' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <span className="text-sm">{t.message}</span>
            <button onClick={() => remove(t.id)} className="text-xs text-slate-500">Dismiss</button>
          </div>
        </div>
      ))}
    </div>
  )
}

