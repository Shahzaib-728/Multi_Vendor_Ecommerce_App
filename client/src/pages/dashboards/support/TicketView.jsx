import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Send, CheckCircle, ArrowLeft, User, Clock, ShieldCheck } from 'lucide-react'
import { getTicketById, replyTicket } from '../../../services/support'
import { useUIStore } from '../../../store/ui'
import { useAuthStore } from '../../../store/auth'
import socket from '../../../socket'

export default function SupportTicketView() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)

  const user = useAuthStore(s => s.user)
  const pushToast = useUIStore(s => s.pushToast)
  const scrollRef = useRef(null)

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await getTicketById(id)
        setTicket(data)
        setMessages(data.messages || [])
        setLoading(false)
        socket.connect()
        socket.emit('join_ticket', id)
      } catch (err) {
        console.error(err)
        pushToast({ type: 'error', message: 'Failed to load ticket' })
        setLoading(false)
      }
    }
    fetchTicket()
    return () => { socket.disconnect() }
  }, [id])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    const handleMsg = (msg) => {
      if (msg.sender && msg.sender._id === user._id) return
      if (msg.sender === user._id) return
      setMessages(prev => [...prev, msg])
    }
    socket.on('receive_message', handleMsg)
    return () => socket.off('receive_message', handleMsg)
  }, [user])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputText.trim()) return
    const text = inputText
    setInputText('')
    setMessages(prev => [...prev, { text, sender: { _id: user._id, name: user.name, role: user.role }, timestamp: new Date() }])
    try {
      await replyTicket(id, text)
    } catch (err) {
      pushToast({ type: 'error', message: 'Failed to send reply' })
    }
  }

  const handleResolve = async () => {
    if (confirm('Are you sure you want to mark this ticket as resolved?')) {
      try {
        await replyTicket(id, "TICKET RESOLUTION: Marked as solved by support team.")
        setTicket(prev => ({ ...prev, status: 'Resolved' }))
        pushToast({ type: 'success', message: 'Ticket resolved' })
      } catch (err) {
        pushToast({ type: 'error', message: 'Resolution failed' })
      }
    }
  }

  if (loading) return <div className="p-24 text-center text-slate-500 font-medium">Connecting to session...</div>
  if (!ticket) return <div className="p-24 text-center text-red-500 font-bold uppercase tracking-widest">Ticket Not Found</div>

  return (
    <div className="max-w-4xl mx-auto h-[calc(100dvh-140px)] flex flex-col animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 md:mb-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Link to="/support/tickets" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shrink-0">
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">#{id.slice(-6).toUpperCase()}: {ticket.subject}</h1>
            <p className="text-xs text-slate-500 font-medium truncate">Customer: {ticket.customer?.name}</p>
          </div>
        </div>

        {ticket.status !== 'Resolved' && ticket.status !== 'Closed' ? (
          <button onClick={handleResolve} className="w-full md:w-auto bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-emerald-700 transition-all shadow-md">
            <ShieldCheck size={16} /> Mark Resolved
          </button>
        ) : (
          <div className="w-full md:w-auto bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold border border-slate-200">
            <CheckCircle size={16} /> {ticket.status.toUpperCase()}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
        <div className="flex-1 p-6 overflow-y-auto space-y-6" ref={scrollRef}>
          {messages.map((msg, idx) => {
            const isMe = (msg.sender?._id === user._id) || (msg.sender === user._id)
            const senderName = msg.sender?.name || (isMe ? 'Support' : 'Customer')

            return (
              <div key={idx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${isMe ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <User size={14} />
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${isMe ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-slate-50 text-slate-900 rounded-tl-none border border-slate-100 shadow-sm'}`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isMe ? 'text-slate-400' : 'text-slate-500'}`}>{senderName}</div>
                  <div className="leading-relaxed">{msg.text}</div>
                  <div className={`text-[9px] font-bold uppercase mt-2 text-right ${isMe ? 'text-slate-500' : 'text-slate-400'}`}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Input Area */}
        {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
          <form onSubmit={handleSend} className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-slate-900 outline-none transition-all"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
            />
            <button type="submit" disabled={!inputText.trim()} className="bg-slate-900 text-white px-5 rounded-xl flex items-center justify-center transition-all hover:bg-black disabled:opacity-50">
              <Send size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
