import { useState, useEffect } from 'react'
import { Search, Filter, MoreHorizontal, User, Truck, ShoppingBag, Shield, UserX, Activity } from 'lucide-react'
import { getUsers, deleteUser } from '../../../services/admin'
import { useUIStore } from '../../../store/ui'
import SelectMenu from '../../../components/SelectMenu'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const pushToast = useUIStore(s => s.pushToast)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (err) {
      pushToast({ type: 'error', message: 'Failed to fetch users' })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBlock = async (id) => {
    try {
      const confirmed = window.confirm('Are you sure you want to toggle the block status for this user?')
      if (!confirmed) return
      await deleteUser(id)
      pushToast({ type: 'success', message: 'User status updated' })
      fetchUsers()
    } catch (err) {
      pushToast({ type: 'error', message: 'Action failed' })
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'All' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleIcon = (role) => {
    const style = "text-slate-600"
    switch (role) {
      case 'Seller': return <ShoppingBag size={18} className={style} />
      case 'Delivery': return <Truck size={18} className={style} />
      case 'Support': return <Shield size={18} className={style} />
      default: return <User size={18} className={style} />
    }
  }

  if (loading) return <div className="p-24 text-center text-slate-500 font-medium">Loading user directory...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">Monitor and manage all user accounts on the platform.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <SelectMenu
              label="Filter Role"
              options={[
                { id: 'All', label: 'All Roles' },
                { id: 'Customer', label: 'Customers' },
                { id: 'Seller', label: 'Sellers' },
                { id: 'Delivery', label: 'Delivery' },
                { id: 'Support', label: 'Support' }
              ]}
              selectedId={roleFilter}
              onChange={(option) => setRoleFilter(option.id)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                        {user.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-50 rounded-lg">
                        {getRoleIcon(user.role)}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${!user.blocked
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                      {!user.blocked ? 'ACTIVE' : 'BLOCKED'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleToggleBlock(user._id)} className={`p-2 rounded-lg transition-all ${user.blocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'}`}>
                      {user.blocked ? <User size={18} /> : <UserX size={18} />}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">No users found.</div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user._id} className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                      {user.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{user.name}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                    </div>
                  </div>
                  <button onClick={() => handleToggleBlock(user._id)} className={`p-2 rounded-lg transition-all ${user.blocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'}`}>
                    {user.blocked ? <User size={18} /> : <UserX size={18} />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-50 rounded-lg">
                      {getRoleIcon(user.role)}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{user.role}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-400">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${!user.blocked
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                      {!user.blocked ? 'ACTIVE' : 'BLOCKED'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
