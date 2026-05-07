export default function Hero() {
    return (
        <div className="relative overflow-hidden bg-white">
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <svg className="absolute -z-10 w-full h-full opacity-30" viewBox="0 0 1440 676" fill="none" preserveAspectRatio="none">
                    <defs>
                        <radialGradient id="grad1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="rotate(90 720 338) scale(812)">
                            <stop offset="0" stopColor="#000" stopOpacity="0.2" />
                            <stop offset="1" stopColor="#fff" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grad1)" />
                </svg>
            </div>

            <div className="container relative z-10 pt-10 pb-16 md:pt-20 md:pb-24 flex flex-col items-center text-center">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 border border-black/10 bg-white/50 backdrop-blur-sm rounded-full px-4 py-1.5 mb-8 shadow-sm">
                    <span className="flex h-2 w-2 rounded-full bg-black"></span>
                    <span className="text-sm font-medium text-gray-800">New Collection Live</span>
                </div>

                {/* Hero Text */}
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-black max-w-4xl mb-6">
                    Elevate Your <br className="hidden md:block" /> Urban Aesthetic.
                </h1>

                <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed">
                    Discover a curated selection of premium essentials designed for the modern lifestyle. Quality, comfort, and style in every stitch.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <a href="/products" className="w-full sm:w-auto px-8 py-3.5 bg-black text-white text-sm font-semibold rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                        Shop Collection
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </a>
                    <a href="#featured" className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-200 text-black text-sm font-semibold rounded hover:bg-gray-50 transition-colors">
                        View Lookbook
                    </a>
                </div>

                {/* Hero Image */}
                <div className="mt-10 w-full max-w-4xl px-4">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[16/9] bg-gray-100 group">
                        <img
                            src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2671&auto=format&fit=crop"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt="Urban Edge Collection"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
