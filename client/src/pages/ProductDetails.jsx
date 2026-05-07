import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductById } from '../services/products'
import { useCartStore } from '../store/cart'
import { useUIStore } from '../store/ui'
import { Minus, Plus, ShoppingCart, Truck, ShieldCheck } from 'lucide-react'
import { formatCurrency } from '../utils/format'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const add = useCartStore(s => s.add)
  const pushToast = useUIStore(s => s.pushToast)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getProductById(id)
      .then(data => {
        setProduct(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Failed to load product')
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="container py-8 text-center">Loading...</div>
  if (error) return <div className="container py-8 text-center text-red-600">{error}</div>
  if (!product) return <div className="container py-8 text-center">Product not found</div>

  const handleAddToCart = () => {
    add({ ...product, qty })
    pushToast({ type: 'success', message: `Added ${qty} item(s) to cart` })
  }

  const handleBuyNow = () => {
    // Direct checkout without adding to persistent cart
    navigate('/checkout', { state: { directPurchase: { ...product, qty } } })
  }

  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border p-4">
          <img src={product.image} alt={product.name} className="w-full h-full object-contain max-h-[500px]" />
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">{product.name}</h1>
            {product.discountPrice && product.discountPrice < product.price ? (
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-red-600">{formatCurrency(product.discountPrice)}</p>
                <p className="text-xl text-slate-400 line-through">{formatCurrency(product.price)}</p>
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-bold">
                  {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                </span>
              </div>
            ) : (
              <p className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</p>
            )}
          </div>

          <p className="text-slate-600 leading-relaxed">{product.description || 'No description available for this product.'}</p>

          <div className="flex flex-col gap-4 py-4 border-y border-slate-100">
            <div className="flex gap-4">
              <div className="flex items-center border rounded-lg bg-slate-50">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-3 hover:text-primary transition-colors"
                  disabled={qty <= 1}
                >
                  <Minus size={20} />
                </button>
                <span className="w-12 text-center font-semibold text-lg">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="p-3 hover:text-primary transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-white text-primary border-2 border-primary py-3 px-6 rounded-lg font-semibold hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
            </div>
            <button
              onClick={handleBuyNow}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 uppercase tracking-wide"
            >
              Buy Now
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-100 rounded-full"><Truck size={18} className="text-primary" /></div>
              <div>
                <div className="font-semibold text-slate-900">Delivery</div>
                <div className="text-xs">3-5 Working Days</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-100 rounded-full"><ShieldCheck size={18} className="text-primary" /></div>
              <div>
                <div className="font-semibold text-slate-900">Return Policy</div>
                <div className="text-xs">7-Day Free Returns</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
