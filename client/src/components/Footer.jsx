import { Link } from 'react-router-dom'
import { Instagram, Twitter, Facebook, ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="container py-12">
      <div className="bg-white/30 backdrop-blur-xl rounded-[3rem] p-10 md:p-14 border border-white/20 shadow-xl shadow-stone-900/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-stone-600">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-6">
            <h3 className="text-neutral-900 font-black text-xl tracking-tighter">Urban Edge</h3>
            <p className="text-xs font-semibold leading-relaxed text-stone-500">
              Curating high-performance essentials for the modern lifestyle.
            </p>
          </div>

          {/* Quick Links / Support */}
          <div className="space-y-6">
            <h4 className="text-neutral-900 text-xs font-bold">Support</h4>
            <div className="flex flex-col gap-3 text-xs font-semibold">
              <Link to="/faq" className="hover:text-black transition-colors">FAQ</Link>
              <Link to="/shipping" className="hover:text-black transition-colors">Shipping Info</Link>
              <Link to="/returns" className="hover:text-black transition-colors">Return Policy</Link>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-6">
            <h4 className="text-neutral-900 text-xs font-bold">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="p-2.5 bg-neutral-900/5 hover:bg-neutral-900/10 rounded-full transition-all text-neutral-900">
                <Instagram size={18} strokeWidth={1.5} />
              </a>
              <a href="#" className="p-2.5 bg-neutral-900/5 hover:bg-neutral-900/10 rounded-full transition-all text-neutral-900">
                <Twitter size={18} strokeWidth={1.5} />
              </a>
              <a href="#" className="p-2.5 bg-neutral-900/5 hover:bg-neutral-900/10 rounded-full transition-all text-neutral-900">
                <Facebook size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-neutral-900 text-xs font-bold">Newsletter</h4>
            <div className="relative group max-w-xs">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-stone-50/50 border border-stone-200 py-3.5 px-6 rounded-xl text-neutral-900 text-xs outline-none focus:border-neutral-900 transition-all font-semibold placeholder:text-stone-300"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-black text-white px-3 rounded-lg hover:bg-neutral-800 transition-all">
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-10 border-t border-stone-200/30 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-stone-400">
          <p>© 2025 Urban Edge. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-stone-500">Privacy</Link>
            <Link to="/terms" className="hover:text-stone-500">Terms</Link>
            <p>Powered by Urban Edge</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
