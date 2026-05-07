// import { useState } from 'react'
// import { login } from '../services/auth'
// import { useAuthStore } from '../store/auth'
// import { useUIStore } from '../store/ui'
// import { LogIn, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react'
// import { validateField } from '../utils/validation'

// export default function Login() {
//   const [formData, setFormData] = useState({ email: 'customer@example.com', password: 'password' })
//   const [errors, setErrors] = useState({})
//   const setAuth = useAuthStore(s => s.setAuth)
//   const push = useUIStore(s => s.pushToast)

//   const handleInputChange = (e) => {
//     const { name, value } = e.target
//     setFormData(prev => ({ ...prev, [name]: value }))
//     const error = validateField(name, value)
//     setErrors(prev => ({ ...prev, [name]: error }))
//   }

//   const onSubmit = async e => {
//     e.preventDefault()

//     // Final check
//     const newErrors = {}
//     Object.keys(formData).forEach(key => {
//       const err = validateField(key, formData[key])
//       if (err) newErrors[key] = err
//     })

//     if (Object.values(newErrors).some(v => v !== null)) {
//       setErrors(newErrors)
//       return
//     }

//     try {
//       const res = await login(formData)
//       if (res?.user) {
//         setAuth(res.user, res.token)
//         push({ type: 'success', message: 'Welcome back!' })
//       }
//     } catch (err) {
//       push({ type: 'error', message: err.response?.data?.message || 'Invalid credentials' })
//     }
//   }

//   return (
//     <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-stone-50/50">
//       <div className="max-w-5xl w-full grid md:grid-cols-2 bg-white rounded-[3rem] shadow-2xl shadow-black/5 border border-stone-100 overflow-hidden">
//         <div className="bg-stone-900 p-12 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/2" />
//           <div className="relative">
//             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
//               <LogIn size={24} />
//             </div>
//             <h2 className="text-4xl font-black tracking-tighter mb-4">Welcome Back</h2>
//             <p className="text-stone-400 font-medium leading-relaxed max-w-xs">
//               Access your personalized commerce dashboard and manage your transactions with ease.
//             </p>
//           </div>

//           <div className="relative mt-20 pt-12 border-t border-white/10">
//             <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-2">Security Protocol</p>
//             <p className="text-xs text-white/50 leading-relaxed italic">
//               All session data is encrypted using industry-standard protocols.
//             </p>
//           </div>
//         </div>

//         <div className="p-12 lg:p-16">
//           <h3 className="text-xl font-bold text-neutral-900 mb-8">Secure Login</h3>
//           <form onSubmit={onSubmit} className="space-y-6">
//             <div className="space-y-2">
//               <label className="text-sm font-bold text-neutral-500 ml-1">Work Email</label>
//               <div className="relative">
//                 <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
//                 <input
//                   name="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   placeholder="name@company.com"
//                   className={`w-full pl-12 pr-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium placeholder:text-stone-300 ${errors.email ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
//                 />
//               </div>
//               {errors.email && (
//                 <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
//                   <AlertCircle size={10} /> {errors.email}
//                 </p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-bold text-neutral-500 ml-1">Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
//                 <input
//                   name="password"
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   type="password"
//                   placeholder="••••••••"
//                   className={`w-full pl-12 pr-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium placeholder:text-stone-300 ${errors.password ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
//                 />
//               </div>
//               {errors.password && (
//                 <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
//                   <AlertCircle size={10} /> {errors.password}
//                 </p>
//               )}
//             </div>

//             <button className="w-full bg-neutral-900 hover:bg-black text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-black/10 transition-all active:scale-[0.98] mt-8 group">
//               Enter Dashboard
//               <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }

