import { useEffect, useState } from 'react'
import { useProductStore } from '../../../store/products'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Package, Search } from 'lucide-react'
import { useUIStore } from '../../../store/ui'

export default function ManageProducts() {
  const products = useProductStore(s => s.products)
  const loading = useProductStore(s => s.loading)
  const fetchSellerProducts = useProductStore(s => s.fetchSellerProducts)
  const deleteProduct = useProductStore(s => s.deleteProduct)
  const pushToast = useUIStore(s => s.pushToast)
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchSellerProducts()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id)
        pushToast({ type: 'success', message: 'Product deleted successfully' })
      } catch (err) {
        pushToast({ type: 'error', message: err.message || 'Deletion failed' })
      }
    }
  }

  const filteredProducts = products.filter(p => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return true
    return (
      String(p.name || '').toLowerCase().includes(q) ||
      String(p.description || '').toLowerCase().includes(q) ||
      String(p.category || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Products</h1>
          <p className="text-slate-500">Edit, update, and manage your inventory catalog.</p>
        </div>
        <Link to="/seller/add-product" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-black transition-all shadow-sm font-bold text-sm">
          <Plus size={18} /> Add New Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4">
          {/* Search Placeholder */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-slate-900 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Desktop View (Table) */}
          <table className="w-full text-left hidden md:table">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate max-w-[200px]">{p.name}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{p.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${p.stock > 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : p.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                      <Package size={12} />
                      {p.stock} In Stock
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">{p.category}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate('/seller/add-product', { state: { editMode: true, product: p } })}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Package size={32} />
                    </div>
                    <p className="font-bold text-slate-900">No products found</p>
                    <p className="text-sm text-slate-500 mt-1">Start by adding your first product to the catalog.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile View (Cards) */}
          <div className="md:hidden space-y-4 p-4">
            {products.map(p => (
              <div key={p.id} className="bg-slate-50 rounded-xl p-4 space-y-4 border border-slate-100">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-white overflow-hidden border border-slate-100 flex-shrink-0">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 line-clamp-1">{p.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.category}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate('/seller/add-product', { state: { editMode: true, product: p } })}
                          className="p-2 text-slate-400 hover:text-slate-900 bg-white border border-slate-100 rounded-lg"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-slate-400 hover:text-red-500 bg-white border border-slate-100 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-black text-lg text-slate-900">${p.price.toFixed(2)}</span>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${p.stock > 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : p.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                        {p.stock} Left
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Package size={32} />
                </div>
                <p className="font-bold text-slate-900">No products found</p>
                <p className="text-xs text-slate-500 mt-1">{searchTerm.trim() ? 'Try a different search.' : 'Add your first product above.'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
