import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Zap } from 'lucide-react'
import { useCartStore } from '../store/cart'
import { formatCurrency } from '../utils/format'

export default function ProductCard({ product }) {
  const add = useCartStore(s => s.add)
  const navigate = useNavigate()

  const handleBuyNow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Direct checkout without adding to persistent cart
    navigate('/checkout', { state: { directPurchase: { ...product, qty: 1 } } })
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    add(product)
  }

  const hasDiscount = product.discountPrice && product.discountPrice < product.price

  return (
    <div className="group relative bg-white rounded-[1.75rem] sm:rounded-[2.5rem] p-2 sm:p-3 shadow-md border border-stone-100/50 hover:shadow-2xl hover:shadow-stone-900/10 transition-all duration-700 hover:-translate-y-2">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] bg-stone-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />

        {/* New Drop Badge */}
        {product.isNew && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-900">New</span>
          </div>
        )}

        {/* Floating Actions - Visible on Hover for Desktop, Fixed for Mobile */}
        <div className="absolute inset-x-3 sm:inset-x-4 bottom-3 sm:bottom-4 flex flex-row gap-2 transition-all duration-500 lg:flex-col lg:translate-y-12 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
          <button
            onClick={handleBuyNow}
            className="flex-1 min-h-12 bg-neutral-900 text-white py-2.5 rounded-full flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
          >
            <Zap size={14} fill="white" />
            <span className="text-[10px] font-bold lg:hidden">Buy</span>
            <span className="text-[10px] font-bold hidden lg:inline">Buy Now</span>
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 min-h-12 bg-white text-neutral-900 py-2.5 rounded-full flex items-center justify-center gap-2 hover:bg-stone-50 transition-all shadow-lg active:scale-95 border border-stone-100"
          >
            <ShoppingCart size={14} />
            <span className="text-[10px] font-bold lg:hidden">Cart</span>
            <span className="text-[10px] font-bold hidden lg:inline">Add to Cart</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-3 px-2 sm:px-3 pb-1 flex justify-between items-start">
        <div className="space-y-0.5 overflow-hidden">
          <Link to={`/products/${product._id || product.id}`}>
            <h3 className="text-sm font-bold text-neutral-900 truncate hover:text-stone-500 transition-colors">{product.name}</h3>
          </Link>
          <p className="text-[10px] text-stone-400 font-semibold">{product.category}</p>
        </div>
        <div className="text-right ml-2 shrink-0">
          {hasDiscount ? (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-stone-400 line-through tracking-tighter">{formatCurrency(product.price)}</span>
              <span className="text-sm font-black text-neutral-900 leading-none">{formatCurrency(product.discountPrice)}</span>
            </div>
          ) : (
            <span className="text-sm font-black text-neutral-900 leading-none">{formatCurrency(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  )
}
