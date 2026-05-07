import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { LogOut, User, Bell, Menu, X, Truck, CircleDollarSign, ClipboardList, Wallet, MessageSquare, AlertCircle, PlusSquare } from 'lucide-react'
import { useState } from 'react'

const linksByRole = {
  Customer: [
    { to: '/orders', label: 'Orders', icon: ClipboardList },
    { to: '/refunds', label: 'Refunds', icon: AlertCircle },
    { to: '/profile', label: 'Profile', icon: User }
  ],
  Seller: [
    { to: '/seller/revenue', label: 'Revenue', icon: CircleDollarSign },
    { to: '/seller/wallet', label: 'Wallet', icon: Wallet },
    { to: '/seller/products', label: 'Managed Products', icon: ClipboardList },
    { to: '/seller/add-product', label: 'Add Product', icon: PlusSquare },
    { to: '/seller/orders', label: 'Orders', icon: ClipboardList },
    { to: '/seller/refunds', label: 'Refunds', icon: AlertCircle },
    { to: '/seller/profile', label: 'Profile', icon: User }
  ],
  Delivery: [
    { to: '/delivery/assigned', label: 'Assigned Orders', icon: Truck },
    { to: '/delivery/wallet', label: 'My Earnings', icon: Wallet },
    { to: '/delivery/profile', label: 'Profile', icon: User }
  ],
  Support: [
    { to: '/support/tickets', label: 'Tickets', icon: MessageSquare },
    { to: '/support/refunds', label: 'Disputes', icon: AlertCircle }
  ],
  Admin: [
    { to: '/admin', label: 'Dashboard', icon: CircleDollarSign },

    { to: '/admin/finance', label: 'Finance', icon: Wallet },
    { to: '/admin/sellers', label: 'Sellers', icon: User },
    { to: '/admin/users', label: 'Users', icon: User },
    { to: '/admin/delivery-partners', label: 'Delivery Partners', icon: Truck }
  ]
}

export default function DashboardLayout({ role }) {
  const links = linksByRole[role] || []
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Dynamic link filtering for Pending Sellers
  let visibleLinks = links
  if (role === 'Seller') {
    const isApproved = user?.sellerDetails?.approvalStatus === 'Approved'
    if (!isApproved) {
      // Pending/Rejected sellers can only see Profile to fix/view status
      visibleLinks = links.filter(l => l.label === 'Profile')
    }
  }

  return (
    <div className={`min-h-screen ${role === 'Customer' ? '' : 'bg-[#F9FAFB]'} flex font-inter`}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 ${role === 'Customer' ? 'bg-[#fdfbf7]' : 'bg-white'} border-r border-stone-200 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-stone-100">
          <Link to={links[0]?.to || '/'} className="font-bold text-xl flex items-center gap-2 text-neutral-900">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-[10px] tracking-tighter">UE</div>
            Urban Edge
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 px-3 text-stone-400">{role} Dashboard</div>
          <nav className="space-y-2">
            {visibleLinks.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                  ? 'bg-stone-100 text-black font-semibold shadow-sm'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-black'
                  }`}
              >
                {({ isActive }) => (
                  <>
                    {l.icon && <l.icon size={18} strokeWidth={isActive ? 2 : 1.5} />}
                    <span className="text-xs font-bold uppercase tracking-widest">{l.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-stone-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all text-stone-500 hover:bg-stone-50 hover:text-red-500">
            <LogOut size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 lg:ml-64 flex flex-col min-h-screen ${role === 'Customer' ? 'bg-transparent' : ''}`}>
        {/* Top Header */}
        <header className={`h-16 border-b flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 ${role === 'Customer' ? 'bg-white/40 backdrop-blur-md border-stone-200' : 'bg-white border-neutral-100'}`}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600">
            <Menu size={24} />
          </button>

          <div className="ml-auto flex items-center gap-4">
            <button className="relative p-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className={`flex items-center gap-3 pl-4 border-l ${role === 'Customer' ? 'border-stone-200' : 'border-neutral-100'}`}>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-black text-neutral-900 uppercase tracking-tighter">{user?.name}</div>
                <div className="text-[10px] text-stone-500 font-bold">{user?.email}</div>
              </div>
              <div className="w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center font-black text-xs shadow-lg shadow-black/10">
                {user?.name?.[0] || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-12 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
