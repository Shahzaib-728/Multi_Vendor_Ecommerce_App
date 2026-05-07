import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, AlertCircle, CheckCircle, Clock, Search, Scale, ShieldAlert, X, User } from 'lucide-react'
import api from '../../../services/api'
import { getTickets } from '../../../services/support'
import { useUIStore } from '../../../store/ui'
import UnifiedView from '../../../components/UnifiedView'
import DisputeConsole from './DisputeConsole'
import { validateField } from '../../../utils/validation'

export default function Tickets() {
  const [tickets, setTickets] = useState([])
  const [disputedRefunds, setDisputedRefunds] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchError, setSearchError] = useState(null)
  const [searchResults, setSearchResults] = useState(null)
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [searching, setSearching] = useState(false)
  const pushToast = useUIStore(s => s.pushToast)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const ticketsData = await getTickets()
      setTickets(ticketsData)

      const { data: disputes } = await api.get('/refunds/disputed')
      setDisputedRefunds(disputes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGlobalSearch = async (e) => {
    e.preventDefault()
    const err = searchError || null
    if (err) return
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const { data } = await api.get(`/support/search?query=${encodeURIComponent(searchQuery.trim())}`)
      setSearchResults(data)
    } catch (err) {
      alert('Search failed')
    } finally {
      setSearching(false)
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700 border-red-200'
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Closed': return 'bg-slate-100 text-slate-500 border-slate-200'
      case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      default: return 'bg-slate-50 text-slate-400 border-slate-100'
    }
  }

  if (loading) return <div className="p-24 text-center text-slate-500 font-medium">Loading support console...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support Center</h1>
          <p className="text-slate-500">Manage tickets, disputes, and customer inquiries.</p>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleGlobalSearch} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search Order ID, Email, or Ticket..."
            value={searchQuery}
            onChange={(e) => {
              const v = e.target.value
              setSearchQuery(v)
              setSearchError(v.trim() ? validateField('supportSearchQuery', v) : null)
            }}
            className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl outline-none focus:border-slate-900 transition-all shadow-sm text-sm ${searchError ? 'border-red-500' : 'border-slate-200'}`}
          />
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          {searching && (
            <div className="absolute right-3.5 top-3 animate-spin">
              <Clock size={18} className="text-slate-400" />
            </div>
          )}
          {searchError && (
            <p className="absolute left-0 -bottom-5 text-[10px] text-red-500 flex items-center gap-1">
              <AlertCircle size={10} /> {searchError}
            </p>
          )}
        </form>
      </div>

      {/* Disputed Refunds Section */}
      {disputedRefunds.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-600">
            <Scale size={18} />
            <h2 className="font-bold text-sm uppercase tracking-wider">Escalated Disputes ({disputedRefunds.length})</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disputedRefunds.map(dispute => (
              <div key={dispute._id} onClick={() => setSelectedDispute(dispute)} className="bg-white border border-red-100 p-6 rounded-2xl cursor-pointer hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="font-bold text-slate-900 mb-1">Order #{dispute.order?._id.slice(-6).toUpperCase()}</div>
                <div className="text-xs text-slate-500 mb-4 line-clamp-2">"{dispute.customerMessage}"</div>
                <div className="pt-4 border-t flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                  <span>{dispute.customer?.name}</span>
                  <span className="text-red-600">Requires Review</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDispute && (
        <DisputeConsole
          dispute={selectedDispute}
          onClose={() => setSelectedDispute(null)}
          onSuccess={() => {
            fetchData();
            pushToast({ type: 'success', message: 'Dispute resolved successfully' });
          }}
        />
      )}

      {searchResults && (
        <UnifiedView data={searchResults} onClose={() => setSearchResults(null)} />
      )}

      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Customer Tickets</h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {tickets.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold text-slate-900">No active tickets</p>
              <p className="text-sm">Great job! All support inquiries are resolved.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tickets.map(ticket => (
                <Link key={ticket._id} to={`/support/tickets/${ticket._id}`} className="block p-6 hover:bg-slate-50 transition-all group">
                  <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400">#{ticket._id.slice(-6).toUpperCase()}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusStyle(ticket.status)}`}>{ticket.status}</span>
                      {ticket.priority === 'High' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center gap-1">
                          <AlertCircle size={10} /> High Priority
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(ticket.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{ticket.subject}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <User size={12} /> {ticket.customer?.name || 'Customer'}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
