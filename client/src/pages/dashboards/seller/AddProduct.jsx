import { useState, useEffect } from 'react'
import { useProductStore } from '../../../store/products'
import { useUIStore } from '../../../store/ui'
import { useNavigate, useLocation } from 'react-router-dom'
import { Upload, ArrowLeft, Image as ImageIcon, Save, X, AlertCircle, ShoppingBag } from 'lucide-react'
import { PRODUCT_CATEGORIES } from '../../../utils/constants'
import { validateField } from '../../../utils/validation'
import SelectMenu from '../../../components/SelectMenu'

export default function AddProduct() {
  const addProduct = useProductStore(s => s.addProduct)
  const updateProduct = useProductStore(s => s.updateProduct)
  const pushToast = useUIStore(s => s.pushToast)
  const navigate = useNavigate()
  const location = useLocation()

  const editMode = location.state?.editMode
  const productToEdit = location.state?.product

  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountPrice: '',
    category: PRODUCT_CATEGORIES[0],
    stock: '',
    description: '',
    image: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editMode && productToEdit) {
      setFormData({
        name: productToEdit.name,
        price: productToEdit.price,
        discountPrice: productToEdit.discountPrice || '',
        category: productToEdit.category,
        stock: productToEdit.stock,
        description: productToEdit.description,
        image: productToEdit.image
      })
    }
  }, [editMode, productToEdit])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Real-time validation
    let error = null
    if (name === 'name') error = value.trim().length < 3 ? 'Name must be at least 3 characters' : null
    if (name === 'price' || name === 'stock' || name === 'discountPrice') error = validateField(name, value)

    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        pushToast({ type: 'error', message: 'Image size must be less than 10MB' })
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Final validation
    const newErrors = {}
    if (formData.name.trim().length < 3) newErrors.name = 'Name must be at least 3 characters'
    const priceErr = validateField('price', formData.price)
    if (priceErr) newErrors.price = priceErr
    const stockErr = validateField('stock', formData.stock)
    if (stockErr) newErrors.stock = stockErr
    const discountErr = validateField('discountPrice', formData.discountPrice)
    if (discountErr) newErrors.discountPrice = discountErr

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      pushToast({ type: 'error', message: 'Please fix the errors in the form' })
      return
    }

    setSubmitting(true)
    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        stock: Number(formData.stock),
        image: formData.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'
      }

      if (editMode) {
        await updateProduct(productToEdit._id || productToEdit.id, productData)
        pushToast({ type: 'success', message: 'Product updated successfully' })
      } else {
        await addProduct(productData)
        pushToast({ type: 'success', message: 'Product added successfully' })
      }
      navigate('/seller/products')
    } catch (err) {
      pushToast({ type: 'error', message: err.response?.data?.message || 'Failed to save product' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center bg-white border border-stone-100 rounded-2xl shadow-sm hover:bg-stone-50 transition-all active:scale-90"
          >
            <ArrowLeft size={20} className="text-stone-600" />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-neutral-900">{editMode ? 'Edit Product' : 'Build Your Inventory'}</h1>
            <p className="text-stone-500 font-medium">Capture the essence of your product with rich details.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-4 text-stone-500 font-bold hover:text-neutral-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-neutral-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-black/10 transition-all active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : editMode ? 'Update Product' : 'Launch Product'}
            <Save size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-stone-100 p-10 shadow-2xl shadow-black/[0.02]">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-8">
                {/* Section: Basic Identity */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-stone-500">
                      <ShoppingBag size={16} />
                    </div>
                    <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Product Identity</h2>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-500 ml-1">Product Name</label>
                    <input
                      name="name"
                      required
                      className={`w-full px-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-stone-300 font-medium ${errors.name ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Urban Edge Minimalist Sneakers"
                    />
                    {errors.name && (
                      <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                        <AlertCircle size={10} /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-neutral-500 ml-1">Base Price (PKR)</label>
                      <input
                        name="price"
                        required
                        type="number"
                        min="0"
                        step="1"
                        className={`w-full px-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-stone-300 font-medium ${errors.price ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                      {errors.price && (
                        <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                          <AlertCircle size={10} /> {errors.price}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-neutral-500 ml-1">Discount Price (Optional)</label>
                      <input
                        name="discountPrice"
                        type="number"
                        min="0"
                        step="1"
                        className={`w-full px-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-stone-300 font-medium ${errors.discountPrice ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                        value={formData.discountPrice}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                      {errors.discountPrice && (
                        <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                          <AlertCircle size={10} /> {errors.discountPrice}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-stone-50" />

                {/* Section: Classification */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-neutral-500 ml-1">Category</label>
                      <SelectMenu
                        value={formData.category}
                        onChange={(v) => handleInputChange({ target: { name: 'category', value: v } })}
                        options={PRODUCT_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                        className="w-full"
                        buttonClassName="w-full px-6 py-4 border border-stone-100 bg-stone-50/50 hover:bg-stone-50 rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all font-medium cursor-pointer"
                        ariaLabel="Category"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-neutral-500 ml-1">Inventory Level</label>
                      <input
                        name="stock"
                        required
                        type="number"
                        min="0"
                        className={`w-full px-6 py-4 border rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-stone-300 font-medium ${errors.stock ? 'border-red-500' : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50'}`}
                        value={formData.stock}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                      {errors.stock && (
                        <p className="text-[10px] text-red-500 ml-3 flex items-center gap-1">
                          <AlertCircle size={10} /> {errors.stock}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-500 ml-1">Product Description</label>
                    <textarea
                      name="description"
                      required
                      rows="5"
                      className="w-full px-6 py-4 border border-stone-100 bg-stone-50/50 hover:bg-stone-50 rounded-2xl focus:ring-1 focus:ring-black outline-none transition-all resize-none font-medium placeholder:text-stone-300"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the unique features, materials, and value of your product..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Visuals */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
          <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-2xl shadow-black/[0.02]">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Product Media</h2>
              <ImageIcon size={20} className="text-stone-300" />
            </div>

            <div className={`aspect-[4/5] border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-500 ${formData.image ? 'border-transparent' : 'border-stone-100 bg-stone-50 hover:bg-white hover:border-neutral-900'}`}>
              {formData.image ? (
                <>
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-xl active:scale-90 transition-transform"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 space-y-4">
                  <div className="w-20 h-20 bg-white shadow-xl shadow-black/[0.03] rounded-[1.5rem] flex items-center justify-center mx-auto text-neutral-400 group-hover:text-neutral-900 transition-colors">
                    <Upload size={32} />
                  </div>
                  <div>
                    <p className="text-base font-bold text-neutral-900">Upload Product Image</p>
                    <p className="text-xs text-stone-400 mt-1 font-medium italic">High-res photos sell better!</p>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
            </div>

            <div className="mt-8 p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="flex gap-4 items-start">
                <div className="mt-1">
                  <AlertCircle size={16} className="text-stone-400" />
                </div>
                <p className="text-[11px] text-stone-500 font-medium leading-relaxed">
                  Recommended size: 1200x1500px. Maximise visual impact with clean, professional backgrounds. Max file size: 10MB.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
