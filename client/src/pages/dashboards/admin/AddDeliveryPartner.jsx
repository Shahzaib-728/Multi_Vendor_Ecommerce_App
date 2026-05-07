import { useState } from 'react'
import { addDeliveryPartner } from '../../../services/admin'
import { useUIStore } from '../../../store/ui'
import { AlertCircle } from 'lucide-react'
import { validateField } from '../../../utils/validation'
export default function AddDeliveryPartner() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const push = useUIStore(s => s.pushToast)
  const submit = async e => {
    e.preventDefault()
    const newErrors = {
      name: validateField('name', name),
      email: validateField('email', email)
    }
    if (Object.values(newErrors).some(v => v)) {
      setErrors(newErrors)
      push({ type: 'error', message: 'Please fix the errors in the form' })
      return
    }
    const r = await addDeliveryPartner({ name, email })
    if (r?.id) push({ type: 'success', message: 'Partner added' })
  }
  return (
    <form onSubmit={submit} className="grid gap-3">
      <h1 className="text-2xl font-bold">Add Delivery Partner</h1>
      <div className="grid gap-1">
        <input
          value={name}
          onChange={e => {
            const v = e.target.value
            setName(v)
            setErrors(prev => ({ ...prev, name: validateField('name', v) }))
          }}
          placeholder="Name"
          className={`px-3 py-2 border rounded ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && (
          <p className="text-[10px] text-red-500 flex items-center gap-1">
            <AlertCircle size={10} /> {errors.name}
          </p>
        )}
      </div>
      <div className="grid gap-1">
        <input
          value={email}
          onChange={e => {
            const v = e.target.value
            setEmail(v)
            setErrors(prev => ({ ...prev, email: validateField('email', v) }))
          }}
          placeholder="Email"
          className={`px-3 py-2 border rounded ${errors.email ? 'border-red-500' : ''}`}
        />
        {errors.email && (
          <p className="text-[10px] text-red-500 flex items-center gap-1">
            <AlertCircle size={10} /> {errors.email}
          </p>
        )}
      </div>
      <button className="bg-primary text-white px-4 py-2 rounded">Save</button>
    </form>
  )
}
