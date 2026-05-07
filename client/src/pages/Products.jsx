import { useEffect, useMemo, useState } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { getAllProducts } from '../services/products'
import ProductCard from '../components/ProductCard'
import { PRODUCT_CATEGORIES } from '../utils/constants'
import SelectMenu from '../components/SelectMenu'

export default function Products() {
  const [allProducts, setAllProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const categories = ['All', ...PRODUCT_CATEGORIES]
  const categoryOptions = useMemo(
    () => categories.map(c => ({ value: c, label: c })),
    [categories]
  )

  useEffect(() => {
    setLoading(true)
    getAllProducts().then(data => {
      setAllProducts(data)
      setFilteredProducts(data)
      setLoading(false)
    })
  }, [])

  // Filtering Logic
  useEffect(() => {
    let result = allProducts

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory)
    }

    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredProducts(result)
  }, [searchQuery, selectedCategory, allProducts])

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    const names = []
    const seen = new Set()
    for (const p of allProducts) {
      const name = String(p?.name || '')
      if (!name) continue
      if (!name.toLowerCase().includes(q)) continue
      const key = name.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      names.push(name)
      if (names.length >= 6) break
    }
    return names
  }, [allProducts, searchQuery])

  return (
    <div className="bg-transparent min-h-screen">
      {/* Search & Filter Header */}
      <div className="border-b border-stone-200/50 sticky top-0 lg:top-[80px] z-30 bg-white/40 backdrop-blur-xl">
        <div className="container py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
            <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter text-neutral-900">Curated Goods</h1>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:gap-6 flex-1 max-w-3xl w-full">
              {/* Search Bar */}
              <div className="relative w-full sm:flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-neutral-900 transition-colors" size={18} />
                <input
                  type="search"
                  placeholder="Find your product..."
                  inputMode="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full min-h-12 bg-stone-50/50 border border-stone-200 py-3.5 pl-14 pr-6 text-[16px] sm:text-[12px] lg:text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:bg-white focus:border-neutral-900 transition-all rounded-full shadow-sm placeholder:text-stone-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {isSearchFocused && suggestions.length > 0 && (
                  <div
                    className="absolute left-0 right-0 top-[calc(100%+10px)] bg-white border border-stone-200 rounded-3xl shadow-2xl shadow-black/10 overflow-hidden z-40"
                    role="listbox"
                  >
                    {suggestions.map(s => (
                      <button
                        key={s}
                        type="button"
                        className="w-full min-h-12 px-5 py-3 text-left text-sm font-bold text-neutral-900 hover:bg-stone-50 active:bg-stone-100"
                        onPointerDown={(e) => {
                          e.preventDefault()
                          setSearchQuery(s)
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="relative w-full sm:w-auto sm:min-w-[180px]">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                  <Filter size={14} />
                </div>
                <SelectMenu
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={categoryOptions}
                  placeholder="All"
                  className="w-full"
                  buttonClassName="w-full min-h-12 bg-stone-50/50 border border-stone-200 py-3.5 pl-12 pr-10 text-[16px] sm:text-[12px] lg:text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:bg-white focus:border-neutral-900 transition-all rounded-full shadow-sm cursor-pointer"
                  ariaLabel="Category"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-24">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 gap-y-10 sm:gap-y-16 lg:gap-y-24">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="bg-stone-200/50 aspect-square rounded-[1.75rem] sm:rounded-[2.5rem]"></div>
                <div className="h-4 bg-stone-200/50 w-3/4 mx-auto"></div>
                <div className="h-4 bg-stone-200/50 w-1/4 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 gap-y-10 sm:gap-y-16 lg:gap-y-24">
            {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="py-32 text-center bg-white/20 backdrop-blur-sm rounded-[3rem] border border-dashed border-stone-200">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-neutral-900 mb-3">No Products Found</h3>
            <p className="text-stone-400 text-sm font-medium tracking-tight">Try adjusting your curated search or filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-10 text-[10px] font-black uppercase tracking-[0.3em] border-b border-neutral-900 pb-2 hover:text-stone-500 hover:border-stone-500 transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
