import { useCartStore } from '../store/cart'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import { formatCurrency } from '../utils/format'

export default function Cart() {
  const items = useCartStore(s => s.items)
  const remove = useCartStore(s => s.remove)
  const clear = useCartStore(s => s.clear)
  const increment = useCartStore(s => s.increment)
  const decrement = useCartStore(s => s.decrement)

  const total = items.reduce((t, i) => {
    const price = i.discountPrice && i.discountPrice < i.price ? i.discountPrice : i.price
    return t + price * (i.qty || 1)
  }, 0)

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-neutral-900 mb-2">Empty Bag</h2>
        <p className="text-stone-400 mb-8 text-[12px] font-medium uppercase tracking-widest">Find your next edge.</p>
        <Link to="/products" className="inline-flex items-center gap-3 bg-neutral-900 text-white px-8 py-3.5 rounded-full hover:bg-black transition-all text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10">
          Start Exploring <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-4 flex justify-between items-end border-b border-stone-100 pb-4">
        <div className="space-y-0 text-neutral-900">
          <h1 className="text-xl font-black uppercase tracking-tighter">Your Selection</h1>
          <p className="text-[8px] font-bold text-stone-400 uppercase tracking-[0.3em]">{items.length} ITEM(S)</p>
        </div>
        <button onClick={clear} className="text-[8px] font-black uppercase tracking-[0.3em] text-stone-300 hover:text-red-500 transition-colors py-1.5 px-3 border border-stone-50 rounded-full">
          Clear All
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-1.5">
          {items.map(i => (
            <div key={i.id} className="bg-white/40 backdrop-blur-md rounded-2xl p-2 flex items-center gap-4 border border-stone-200/50 hover:bg-white/60 transition-colors">
              <div className="w-14 h-16 bg-stone-50 rounded-lg overflow-hidden shrink-0">
                <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="overflow-hidden">
                    <h3 className="font-black text-[10px] uppercase tracking-tight text-neutral-900 truncate">{i.name}</h3>
                    <p className="text-[8px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                      {formatCurrency(i.discountPrice || i.price)}
                    </p>
                  </div>
                  <button onClick={() => remove(i.id)} className="text-stone-300 hover:text-red-500 transition-colors p-1 flex-shrink-0">
                    <Trash2 size={10} />
                  </button>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center bg-stone-100/50 rounded-full p-0.5">
                    <button onClick={() => decrement(i.id)} className="p-0.5 hover:bg-white rounded-full transition-all text-neutral-900"><Minus size={8} /></button>
                    <span className="w-5 text-center text-[8px] font-black text-neutral-900">{i.qty || 1}</span>
                    <button onClick={() => increment(i.id)} className="p-0.5 hover:bg-white rounded-full transition-all text-neutral-900"><Plus size={8} /></button>
                  </div>
                  <div className="font-black text-[10px] tracking-tight text-neutral-900">
                    {formatCurrency((i.discountPrice || i.price) * (i.qty || 1))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white/60 backdrop-blur-xl p-5 space-y-5 rounded-[2.5rem] border border-white/20 shadow-xl shadow-stone-900/5">
            <h2 className="text-[8px] font-black uppercase tracking-[0.4em] border-b border-stone-100 pb-3 text-neutral-900">Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-stone-400">
                <span>Subtotal</span>
                <span className="text-neutral-900">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-stone-400">
                <span>Shipping</span>
                <span className="text-stone-500 font-black">Complementary</span>
              </div>
              <div className="pt-3 flex justify-between font-black text-sm uppercase tracking-tighter border-t border-stone-100 text-neutral-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Link to="/checkout" className="block w-full bg-neutral-900 text-white text-center py-3.5 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all rounded-full shadow-xl shadow-black/10 active:scale-95">
                Go to Checkout
              </Link>
              <Link to="/products" className="block w-full text-center text-[8px] font-black uppercase tracking-widest text-stone-300 hover:text-neutral-900 transition-colors">
                Continue Exploring
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
