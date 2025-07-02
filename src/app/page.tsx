import { MartianClock } from '@/features/mars-time';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-950">
      {/* Background stars effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-slate-900/50 to-slate-950"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Mars Weather Dashboard
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-2">
            Real-time Martian time and planetary data
          </p>
          <div className="text-sm text-slate-400">
            🚀 Live data from NASA missions • Updated every second
          </div>
        </header>

        {/* Main content grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Mars Clock - Featured */}
          <div className="lg:col-span-1">
            <section aria-label="Real-time Martian clock">
              <MartianClock />
            </section>
          </div>

          {/* Coming soon sections */}
          <section className="lg:col-span-2 space-y-6" aria-label="Future features">
            <div className="bg-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-3">
                🌡️ Weather Data
              </h2>
              <p className="text-slate-400 mb-4">
                Real-time temperature, pressure, and atmospheric conditions from NASA rovers.
              </p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Coming Soon
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-3">
                📊 Historical Trends
              </h2>
              <p className="text-slate-400 mb-4">
                Interactive charts showing weather patterns and seasonal changes on Mars.
              </p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Coming Soon
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-3">
                📸 Latest Images
              </h2>
              <p className="text-slate-400 mb-4">
                Recent photos from Curiosity and Perseverance rovers on the Martian surface.
              </p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Coming Soon
              </div>
            </div>
          </section>
        </div>

        {/* Technical note */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-slate-800/50 backdrop-blur border border-slate-600 rounded-lg px-6 py-4">
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-slate-300">Technical Demo:</span>{' '}
              Mars time calculations use the NASA Mars24 algorithm with real-time updates.
              <br />
              All time conversions are computed with astronomical precision.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-700">
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-4">
              Built with ❤️ by{' '}
              <span className="font-semibold text-slate-300">Jim McQuillan</span>
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <a 
                href="https://github.com/jimmcq" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors duration-200"
              >
                GitHub
              </a>
              <a 
                href="https://linkedin.com/in/jimmcquillan/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors duration-200"
              >
                LinkedIn
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              © 2025 Jim McQuillan. Open source under MIT License.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
