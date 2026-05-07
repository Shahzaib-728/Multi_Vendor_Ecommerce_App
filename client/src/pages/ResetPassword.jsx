import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, Loader2, CheckCircle2 } from 'lucide-react'
import api from '../services/api'
import { useUIStore } from '../store/ui'

export default function ResetPassword() {
    const { token } = useParams()
    const navigate = useNavigate()
    const pushToast = useUIStore(s => s.pushToast)

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long')
            return
        }

        setLoading(true)
        setError('')

        try {
            await api.post(`/auth/reset-password/${token}`, { password })
            setSuccess(true)
            pushToast({ type: 'success', message: 'Password reset successfully' })
            setTimeout(() => {
                navigate('/')
            }, 3000)
        } catch (err) {
            setError(err.response?.data?.message || 'Reset link may be invalid or expired.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-300">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Lock className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
                    <p className="text-slate-500 mt-2">Create a secure new password for your account.</p>
                </div>

                {success ? (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-8 rounded-2xl text-center animate-in slide-in-from-bottom-2 duration-300">
                        <CheckCircle2 className="mx-auto mb-4 text-emerald-500" size={48} />
                        <h3 className="font-bold text-lg">Password Reset!</h3>
                        <p className="text-sm mt-2 opacity-90">Your password has been updated. Redirecting you to login...</p>
                        <Link to="/" className="inline-block mt-6 px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-200">
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium animate-in shake-in">
                                {error}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">New Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl hover:bg-black transition-all font-bold shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Update Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
