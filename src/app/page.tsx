import { MartianClock } from '@/features/mars-time';

export default function HomePage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-950">
      {/* Background stars effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-slate-900/50 to-slate-950"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">
            Mars Weather Dashboard
          </h1>
          <p className="mb-2 text-lg text-slate-300 md:text-xl">
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
          <section
            className="space-y-6 lg:col-span-2"
            aria-label="Future features"
          >
            <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-6 backdrop-blur">
              <h2 className="mb-3 text-xl font-semibold text-white">
                🌡️ Weather Data
              </h2>
              <p className="mb-4 text-slate-400">
                Real-time temperature, pressure, and atmospheric conditions from
                NASA rovers.
              </p>
              <div className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-300">
                Coming Soon
              </div>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-6 backdrop-blur">
              <h2 className="mb-3 text-xl font-semibold text-white">
                📊 Historical Trends
              </h2>
              <p className="mb-4 text-slate-400">
                Interactive charts showing weather patterns and seasonal changes
                on Mars.
              </p>
              <div className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-300">
                Coming Soon
              </div>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-6 backdrop-blur">
              <h2 className="mb-3 text-xl font-semibold text-white">
                📸 Latest Images
              </h2>
              <p className="mb-4 text-slate-400">
                Recent photos from Curiosity and Perseverance rovers on the
                Martian surface.
              </p>
              <div className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-300">
                Coming Soon
              </div>
            </div>
          </section>
        </div>

        {/* Technical note */}
        <div className="mt-12 text-center">
          <div className="inline-block rounded-lg border border-slate-600 bg-slate-800/50 px-6 py-4 backdrop-blur">
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-slate-300">
                Technical Demo:
              </span>{' '}
              Mars time calculations use the NASA Mars24 algorithm with
              real-time updates.
              <br />
              All time conversions are computed with astronomical precision.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-700 pt-8">
          <div className="text-center">
            <p className="mb-4 text-sm text-slate-400">
              Built with ❤️ by{' '}
              <span className="font-semibold text-slate-300">
                Jim McQuillan
              </span>
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <a
                href="https://github.com/jimmcq"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 transition-colors duration-200 hover:text-white"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/jimmcquillan/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 transition-colors duration-200 hover:text-white"
              >
                LinkedIn
              </a>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              © 2025 Jim McQuillan. Open source under MIT License.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
