import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Loader2 } from 'lucide-react'
import api from '../services/api'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await api.post('/auth/forgot-password', { email })
            setSubmitted(true)
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-300">
                <Link to="/" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-8 text-sm font-medium transition-colors">
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Login
                </Link>

                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Mail className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Forgot Password?</h1>
                    <p className="text-slate-500 mt-2">Enter your email and we'll send you a link to reset your password.</p>
                </div>

                {submitted ? (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-6 rounded-2xl animate-in slide-in-from-bottom-2 duration-300">
                        <p className="font-semibold text-center">Check your inbox!</p>
                        <p className="text-sm mt-2 text-center opacity-90">If an account exists for <strong>{email}</strong>, you will receive an email shortly with reset instructions.</p>
                        <button onClick={() => setSubmitted(false)} className="w-full mt-6 text-sm font-bold text-emerald-900 underline">Try another email</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium animate-in shake-in">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Email Address</label>
                            <input
                                type="email"
                                required
                                placeholder="name@example.com"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl hover:bg-black transition-all font-bold shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Send Reset Link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
