import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { useCartStore } from '../store/cart'
import { useUIStore } from '../store/ui'
import { ShoppingCart, User, LogOut, Package, LayoutDashboard, Menu, X, RotateCcw } from 'lucide-react'
import LoginPopup from './LoginPopup'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const count = useCartStore(s => s.items.reduce((a, b) => a + (b.qty || 1), 0))
  const isLoginPopupOpen = useUIStore(s => s.isLoginPopupOpen)
  const openLoginPopup = useUIStore(s => s.openLoginPopup)
  const location = useLocation()

  const handleAnchorClick = (e, id) => {
    if (location.pathname === '/') {
      e.preventDefault()
      const el = document.getElementById(id)
      if (el) {
        const offset = 100
        const bodyRect = document.body.getBoundingClientRect().top
        const elementRect = el.getBoundingClientRect().top
        const elementPosition = elementRect - bodyRect
        const offsetPosition = elementPosition - offset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
      setIsMobileMenuOpen(false)
    }
  }

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products' },
    { label: 'About', to: '/#about', anchor: 'about' },
    { label: 'Contact', to: '/#contact', anchor: 'contact' },
  ]

  // Customer specific links moved here for better accessibility
  const customerLinks = user?.role === 'Customer' ? [
    { label: 'My Orders', to: '/orders', icon: Package },
    { label: 'Refunds', to: '/refunds', icon: RotateCcw }
  ] : []

  const defaultRoute = (user ? ({
    Customer: '/orders',
    Seller: '/seller/revenue',
    Delivery: '/delivery/assigned',
    Support: '/support/tickets',
    Admin: '/admin/analytics'
  }[user.role] || '/') : '/')

  return (
    <>
      <header className="bg-white/60 sticky top-0 z-50 backdrop-blur-xl border-b border-stone-200/50">
        <div className="container flex items-center justify-between h-20">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-neutral-900"
          >
            <Menu size={24} />
          </button>

          {/* Left: Logo */}
          <Link to="/" className="font-bold text-2xl tracking-tighter flex items-center gap-2 z-10">
            <span className="text-neutral-900">Urban Edge</span>
          </Link>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map(link => (
              link.anchor ? (
                <a
                  key={link.label}
                  href={link.to}
                  onClick={(e) => handleAnchorClick(e, link.anchor)}
                  className="text-xs font-semibold text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) => `text-xs font-semibold transition-colors ${isActive ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-900'}`}
                >
                  {link.label}
                </NavLink>
              )
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 z-10">
            {customerLinks.length > 0 && (
              <div className="hidden xl:flex items-center gap-4 mr-4 border-r border-stone-200 pr-6">
                {customerLinks.map(link => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-neutral-900 transition-colors"
                  >
                    <link.icon size={14} />
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            )}

            {(!user || user.role === 'Customer') && (
              <NavLink to="/cart" className="relative text-neutral-600 hover:text-neutral-900 transition-colors p-2.5 bg-stone-100 hover:bg-stone-200 rounded-full">
                <ShoppingCart size={18} strokeWidth={1.5} />
                {count > 0 && (
                  <span className="absolute top-0 right-0 text-[8px] font-black bg-neutral-900 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-lg border-2 border-white">
                    {count}
                  </span>
                )}
              </NavLink>
            )}

            {!user ? (
              <button
                onClick={openLoginPopup}
                className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white text-xs font-bold hover:bg-black transition-all rounded-full shadow-xl shadow-black/5"
              >
                <User size={16} /> <span className="hidden sm:inline">Sign In</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to={user.role === 'Customer' ? '/profile' : defaultRoute}
                  className="w-10 h-10 flex items-center justify-center bg-neutral-900 text-white rounded-full hover:scale-105 transition-all shadow-lg active:scale-95"
                  title="My Account"
                >
                  <User size={18} />
                </Link>
                <button
                  onClick={() => { logout(); window.location.href = '/'; }}
                  className="p-2.5 text-red-500 hover:bg-red-50 rounded-full transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-0 z-[100] lg:hidden transition-all duration-500 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Content */}
        <aside className={`absolute inset-y-0 left-0 w-[80%] max-w-sm bg-white shadow-2xl transition-transform duration-500 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-20 flex items-center justify-between px-6 border-b border-stone-100">
            <span className="font-black text-xl tracking-tighter text-neutral-900">Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-stone-400 hover:text-neutral-900">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-8 px-6 space-y-10">
            {/* Primary Links */}
            <nav className="flex flex-col gap-6">
              {navLinks.map(link => (
                link.anchor ? (
                  <a
                    key={link.label}
                    href={link.to}
                    onClick={(e) => handleAnchorClick(e, link.anchor)}
                    className="text-2xl font-bold text-neutral-900 active:text-stone-400"
                  >
                    {link.label}
                  </a>
                ) : (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `text-2xl font-bold transition-colors ${isActive ? 'text-neutral-900' : 'text-stone-300'}`}
                  >
                    {link.label}
                  </NavLink>
                )
              ))}
            </nav>

            {/* Customer Specific Section */}
            {user?.role === 'Customer' && (
              <div className="space-y-6 pt-10 border-t border-stone-100">
                <p className="text-xs font-bold text-stone-400">Your Activity</p>
                <div className="flex flex-col gap-4">
                  {customerLinks.map(link => (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 text-sm font-bold text-neutral-900"
                    >
                      <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                        <link.icon size={18} />
                      </div>
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-8 border-t border-stone-100">
            {!user ? (
              <button
                onClick={() => { setIsMobileMenuOpen(false); openLoginPopup(); }}
                className="w-full bg-neutral-900 text-white py-4 rounded-full font-bold text-sm"
              >
                Sign In to Shop
              </button>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center font-black">
                    {user.name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{user.name}</p>
                    <p className="text-xs text-stone-400 font-medium">{user.role}</p>
                  </div>
                </div>
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); window.location.href = '/'; }} className="text-red-500 p-2">
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {isLoginPopupOpen && <LoginPopup />}
    </>
  )
}
