import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, LifeBuoy } from 'lucide-react'
import { createTicket, getActiveTicket, replyTicket } from '../services/support'
import { useAuthStore } from '../store/auth'
import { useUIStore } from '../store/ui'
import socket from '../socket'
import SelectMenu from './SelectMenu'

export default function SupportChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState('menu') // menu, form, chat
    const [messages, setMessages] = useState([])
    const [subject, setSubject] = useState('')
    const [category, setCategory] = useState('General')
    const [input, setInput] = useState('')
    const [ticketId, setTicketId] = useState(null)
    const [sending, setSending] = useState(false)

    const user = useAuthStore(s => s.user)
    const pushToast = useUIStore(s => s.pushToast)
    const scrollRef = useRef(null)

    // FAQ Options
    const FAQ_OPTIONS = [
        { id: 'order', label: 'Where is my order?', action: 'faq_order' },
        { id: 'return', label: 'How to return an item?', action: 'faq_return' },
        { id: 'agent', label: 'Talk to Support Agent', action: 'connect_agent' },
    ]

    // 1. Check for active ticket on mount & Connect Socket
    useEffect(() => {
        if (!user || user.role !== 'Customer') return

        const checkActive = async () => {
            try {
                const ticket = await getActiveTicket()
                if (ticket) {
                    setTicketId(ticket._id)
                    setMessages(ticket.messages || [])
                    setStep('chat')
                    // Join room
                    socket.connect()
                    socket.emit('join_ticket', ticket._id)
                }
            } catch (err) {
                console.error(err)
            }
        }
        checkActive()

        return () => {
            socket.disconnect()
        }
    }, [user])

    // 2. Listen for messages
    useEffect(() => {
        if (!ticketId) return

        const handleMsg = (msg) => {
            // Avoid dupes if we optimistically added it (check by timestamp or ID if available)
            // Ideally we rely on server broadcast. For now, simple append.
            // If sender is ME, I might have double info if I rely on socket echo.
            // But usually sender logic: I append immediately, ignore echo from server OR wait for server.
            // Let's Wait for server for consistency with socket approach, or filter.
            if (msg.sender && msg.sender._id === user._id) return // Ignore my own echo if I append locally
            if (msg.sender === user._id) return

            setMessages(prev => [...prev, msg])
        }

        socket.on('receive_message', handleMsg)
        return () => {
            socket.off('receive_message', handleMsg)
        }
    }, [ticketId, user])

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }, [messages, isOpen, step])


    if (!user || user.role !== 'Customer') return null

    const handleOption = (opt) => {
        setMessages(prev => [...prev, { text: opt.label, sender: { _id: user._id } }]) // mock local sender structure

        if (opt.action === 'faq_order') {
            setTimeout(() => setMessages(prev => [...prev, { text: "You can track your order in 'My Orders' section.", sender: { name: 'Bot' } }]), 500)
        } else if (opt.action === 'faq_return') {
            setTimeout(() => setMessages(prev => [...prev, { text: "Returns are accepted within 7 days.", sender: { name: 'Bot' } }]), 500)
        } else if (opt.action === 'connect_agent') {
            setStep('form')
        }
    }

    const startTicket = async () => {
        if (!input.trim()) return
        setSending(true)
        try {
            const res = await createTicket({
                subject: subject || 'Support Request',
                category,
                message: input
            })
            setTicketId(res._id)
            setMessages(res.messages)
            setStep('chat')
            setInput('')

            socket.connect()
            socket.emit('join_ticket', res._id)

        } catch (err) {
            pushToast({ type: 'error', message: 'Failed to create ticket' })
        } finally {
            setSending(false)
        }
    }

    const sendMessage = async () => {
        if (!input.trim() || !ticketId) return
        const text = input
        setInput('')

        // Optimistic update
        setMessages(prev => [...prev, { text, sender: { _id: user._id }, timestamp: new Date() }])

        try {
            await replyTicket(ticketId, text)
        } catch (err) {
            console.error(err)
            pushToast({ type: 'error', message: 'Failed to send' })
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="pointer-events-auto bg-white w-80 h-96 rounded-2xl shadow-2xl border border-slate-200 flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-primary p-4 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2 font-bold"><LifeBuoy size={20} /> Support Chat</div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={18} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50" ref={scrollRef}>
                        {step === 'menu' && (
                            <div className="space-y-3">
                                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm border border-slate-200">
                                    Hi {user.name}! How can we help you today?
                                </div>
                                {FAQ_OPTIONS.map(opt => (
                                    <button key={opt.id} onClick={() => handleOption(opt)} className="w-full text-left p-2.5 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition shadow-sm text-slate-700">
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {step === 'form' && (
                            <div className="space-y-4">
                                <div className="text-sm text-slate-500 text-center">Describe your issue</div>
                                <input className="w-full p-2 border rounded-lg text-sm" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
                                <SelectMenu
                                    value={category}
                                    onChange={setCategory}
                                    options={[
                                        { value: 'General', label: 'General' },
                                        { value: 'Order Issue', label: 'Order Issue' },
                                        { value: 'Payment', label: 'Payment' }
                                    ]}
                                    className="w-full"
                                    buttonClassName="w-full min-h-12 p-3 border rounded-lg text-sm bg-white font-semibold text-slate-800"
                                    ariaLabel="Ticket category"
                                />
                                <textarea className="w-full p-2 border rounded-lg text-sm h-24 resize-none" placeholder="Message..." value={input} onChange={e => setInput(e.target.value)} />
                                <button onClick={startTicket} disabled={sending} className="w-full min-h-12 bg-black text-white py-2 border-2 border-black font-bold text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-all">
                                    {sending ? 'Starting...' : 'Start Chat'}
                                </button>
                                <button onClick={() => setStep('menu')} className="w-full text-xs text-slate-400">Cancel</button>
                            </div>
                        )}

                        {(step === 'chat' || step === 'menu') && messages.length > 0 && step !== 'form' && (
                            <div className="space-y-3 mt-4">
                                {messages.map((m, i) => {
                                    const isMe = (m.sender?._id === user._id) || (m.sender === user._id) || (m.sender === 'me')
                                    return (
                                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-3 rounded-lg text-sm shadow-sm ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-slate-200 rounded-tl-none text-slate-800'
                                                }`}>
                                                {m.text}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {step === 'chat' && (
                        <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                            <input
                                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Type a message..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            />
                            <button onClick={sendMessage} disabled={!input.trim()} className="bg-primary text-white min-h-12 min-w-12 p-2 rounded-lg hover:bg-primary/90 conversation-send">
                                <Send size={18} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            <button onClick={() => setIsOpen(!isOpen)} className="pointer-events-auto bg-black hover:bg-white hover:text-black border-2 border-black text-white p-4 rounded-full transition-all hover:scale-110 active:scale-95 flex items-center justify-center">
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    )
}
