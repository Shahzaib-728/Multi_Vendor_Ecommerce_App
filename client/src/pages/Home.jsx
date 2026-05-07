import { useEffect, useState } from 'react'
import { Truck, CreditCard, RotateCcw, Headphones, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useDashboardData } from '../hooks/useDashboardData'

const slides = [
  {
    id: 1,
    title: "SUMMER SALE\nFLAT 30% OFF",
    subtitle: "FLASH EVENT",
    desc: "Limited time only. Define your urban edge with our seasonal drops.",
    button: "Shop Now",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop", // High-end fashion
    theme: "dark"
  },
  {
    id: 2,
    title: "Define Your Style.\nNew Season Essentials.",
    subtitle: "LATEST DROP",
    desc: "Curated collection of premium essentials for the modern lifestyle.",
    button: "Shop Collection",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2671&auto=format&fit=crop", // Urban style
    theme: "light"
  },
  {
    id: 3,
    title: "Exclusive Collection.\nJust Dropped.",
    subtitle: "MEMBER EXCLUSIVE",
    desc: "Quality meets aesthetic in every stitch. Discover the new standard.",
    button: "View Lookbook",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop", // Fashion
    theme: "dark"
  }
]

export default function Home() {
  const { products, productsQuery } = useDashboardData({ productsScope: 'all' })
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="overflow-x-hidden">
      {/* Dynamic Hero Slider - Now Contained and Compact */}
      <section className="container pt-10 pb-12">
        <div className="relative h-[60vh] w-full overflow-hidden rounded-[2.5rem] bg-black shadow-2xl shadow-stone-900/10">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover brightness-[0.65]"
              />
              <div className="absolute inset-0 flex items-center">
                <div className="px-12 md:px-20">
                  <div className="max-w-2xl space-y-6 animate-in slide-in-from-left duration-1000">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300/80 block">
                      {slide.subtitle}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9] whitespace-pre-line">
                      {slide.title}
                    </h1>
                    <p className="text-base text-stone-300 font-medium max-w-lg leading-relaxed">
                      {slide.desc}
                    </p>
                    <div className="pb-3">
                      <a href="/products" className="inline-block bg-white text-neutral-900 px-10 py-3.5 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-stone-50 transition-all rounded-full shadow-xl active:scale-95">
                        {slide.button}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slider Controls */}
          <div className="absolute bottom-10 left-0 right-0 z-20">
            <div className="px-12 flex items-center justify-between">
              <div className="flex gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-0.5 transition-all duration-500 ${idx === currentSlide ? 'w-10 bg-white' : 'w-5 bg-white/20'}`}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
                  className="p-3.5 border border-white/10 text-white hover:bg-white hover:text-black transition-all rounded-full backdrop-blur-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
                  className="p-3.5 border border-white/10 text-white hover:bg-white hover:text-black transition-all rounded-full backdrop-blur-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection Section */}
      <section id="featured" className="container py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Curated Goods</span>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-neutral-900">Featured Collection</h2>
          </div>
          <a href="/products" className="text-[10px] font-black uppercase tracking-[0.3em] border-b border-neutral-900 pb-2 hover:text-stone-500 hover:border-stone-500 transition-all w-fit">
            View All
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 gap-y-10 sm:gap-y-16 lg:gap-y-24">
          {productsQuery.isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="bg-stone-200/50 aspect-square rounded-[1.75rem] sm:rounded-[2.5rem]"></div>
                <div className="h-4 bg-stone-200/50 w-3/4 mx-auto"></div>
                <div className="h-4 bg-stone-200/50 w-1/4 mx-auto"></div>
              </div>
            ))
          ) : productsQuery.isError ? (
            <div className="col-span-full text-center py-12 text-stone-500">
              Failed to load products. Please try again.
            </div>
          ) : (
            (products || [])
              .filter(p => p.isFeatured)
              .slice(0, 4)
              .map(p => <ProductCard key={p._id || p.id} product={p} />)
          )}
        </div>
      </section>

      {/* Trust/Features Strip */}
      <section className="py-20">
        <div className="container bg-white/30 backdrop-blur-md rounded-[3rem] border border-amber-200/20 shadow-xl shadow-amber-900/5 p-4 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <Truck size={32} strokeWidth={1} />, title: "Fast Delivery", desc: "Express 2-day priority shipping" },
              { icon: <CreditCard size={32} strokeWidth={1} />, title: "Secure Payment", desc: "Enterprise-grade SSL encryption" },
              { icon: <RotateCcw size={32} strokeWidth={1} />, title: "7-Day Returns", desc: "Hassle-free instant exchanges" },
              { icon: <Headphones size={32} strokeWidth={1} />, title: "24/7 Support", desc: "Direct line to our style experts" }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-4 px-10 group border-r border-stone-200/30 last:border-0 hover:bg-white/40 transition-all duration-700 py-12 rounded-[2rem]">
                <div className="text-neutral-900 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                  {f.icon}
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-900">{f.title}</h4>
                  <p className="text-[9px] text-stone-500 font-bold uppercase tracking-widest leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - Compacted */}
      <section id="about" className="container py-16 border-t border-stone-200/20 mt-12">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Our Story</span>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-neutral-900 leading-[0.9]">Elevating Urban Essentials.</h2>
          <p className="text-base text-stone-500 font-medium leading-relaxed">
            Urban Edge was born from a simple idea: that everyday essentials should be anything but ordinary. We curate pieces that blend modern aesthetics with uncompromising quality.
          </p>
          <div className="flex justify-center gap-16 pt-4">
            <div>
              <h4 className="text-3xl font-black text-neutral-900">12k+</h4>
              <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mt-1">Curated Items</p>
            </div>
            <div>
              <h4 className="text-3xl font-black text-neutral-900">98%</h4>
              <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mt-1">Happy Clients</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Compacted */}
      <section id="contact" className="container py-20">
        <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/20 p-10 md:p-16 text-center space-y-8">
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Get In Touch</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-neutral-900">Let's Connect.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="space-y-1">
              <p className="text-[9px] uppercase font-black tracking-[0.2em] text-stone-400">Sales</p>
              <h4 className="text-base font-bold text-neutral-900">sales@urbanedge.com</h4>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] uppercase font-black tracking-[0.2em] text-stone-400">Support</p>
              <h4 className="text-base font-bold text-neutral-900">help@urbanedge.com</h4>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] uppercase font-black tracking-[0.2em] text-stone-400">Location</p>
              <h4 className="text-base font-bold text-neutral-900">123 Main building, Lahore</h4>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
