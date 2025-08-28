# 🚀 Mars Weather Dashboard

> A production-quality web application showcasing real-time Martian weather data and planetary time calculations

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/jimmcq/mars-weather-dashboard)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://mars-weather-dashboard-one.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-blue?logo=tailwindcss)](https://tailwindcss.com)

## 🌟 Project Goals

- **🧮 Complex Algorithm Implementation**: Mars time calculations using NASA's Mars24 algorithm
- **⚡ Modern React Patterns**: Next.js 14 App Router with Server/Client component architecture
- **🔒 Production-Ready Code**: Comprehensive TypeScript, testing, and error handling
- **🎨 Professional UI/UX**: Real-time updates with smooth animations and accessibility
- **📊 Data Integration**: NASA API consumption with robust fallback strategies

## ✨ Features

### Currently Implemented

- **🕒 Real-time Martian Clock**: Live time calculations for both rover locations
  - Coordinated Mars Time (MTC)
  - Local True Solar Time for Curiosity (Gale Crater)
  - Local True Solar Time for Perseverance (Jezero Crater)
  - Mission sol numbers for both rovers
  - Updates every second with astronomical precision

- **🌡️ Weather Dashboard**: Comprehensive weather data visualization
  - Current atmospheric conditions for both rovers
  - Temperature, pressure, and wind measurements
  - Historical weather trends with interactive charts
  - Data quality indicators and source attribution
  - Graceful fallback strategies for API reliability

- **📸 Latest Images**: Recent photos from Mars rovers
  - Real-time photo feeds from Curiosity and Perseverance
  - Camera information and photo metadata
  - Responsive image galleries with optimized loading

- **🔧 Production-Grade Infrastructure**:
  - Comprehensive error handling and resilience patterns
  - NASA API rate limiting and caching strategies
  - Real-time monitoring with Sentry integration
  - Automated CI/CD pipeline with quality gates

### Coming Soon

- **🔄 Data Export**: Download weather history as CSV
- **🌙 Comparison Mode**: Side-by-side rover data analysis
- **📊 Extended Historical Analysis**: Long-term weather pattern visualization

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state management
- **Animation**: Framer Motion for smooth transitions
- **Charts**: Recharts for interactive data visualization
- **Icons**: Lucide React for consistent iconography
- **Testing**: Jest + React Testing Library + MSW for API mocking
- **Monitoring**: Sentry for error tracking and performance monitoring
- **CI/CD**: GitHub Actions with Lighthouse CI for performance testing
- **Deployment**: Vercel with ISR and optimized caching strategies

## 🧮 Technical Deep Dive: Mars Time Calculations

### The Challenge

Mars has a different day length (24h 37m 22s) and orbital period than Earth, requiring complex calculations to convert between planetary times.

### The Solution

```typescript
// NASA Mars24 algorithm implementation
export const earthToMSD = (date: Date): number => {
  const julianDate = dateToJulian(date);
  const deltaJ2000 = julianDate - MARS_CONSTANTS.J2000_EPOCH;
  return (
    (deltaJ2000 - 4.5) / MARS_CONSTANTS.EARTH_TO_MARS_DAY_RATIO +
    MARS_CONSTANTS.MSD_EPOCH_OFFSET
  );
};
```

### Why This Matters

- **Mathematical Programming**: Demonstrates ability to implement scientific algorithms
- **Precision Engineering**: All calculations verified against NASA reference data
- **Real-time Performance**: Optimized for continuous updates without performance impact

## 🚀 Quick Start

```bash
# Clone and install dependencies
git clone https://github.com/jimmcq/mars-weather-dashboard.git
cd mars-weather-dashboard
yarn install

# Set up environment variables (optional - DEMO_KEY works for development)
cp .env.example .env.local

# Start development server
yarn dev

# Run tests with coverage
yarn test:ci

# Run type checking
yarn type-check

# Build for production
yarn build
```

Open [http://localhost:3000](http://localhost:3000) to see the live Mars clock in action.

## 🧪 Testing Philosophy

This project demonstrates **professional testing practices**:

- **🎯 100% Coverage**: Mars time calculations (critical algorithms)
- **🔧 Integration Tests**: API error handling and data transformation with MSW
- **💨 Component Tests**: React component behavior and user interactions
- **🌐 API Route Tests**: Next.js API route testing with mock data
- **📊 Performance Tests**: Real-time update efficiency and memory usage

**Current Test Stats**: 186 tests across 16 test files, covering critical paths and edge cases.

```bash
yarn test:watch      # Development testing with watch mode
yarn test:ci         # Full coverage report for CI/CD
yarn test:verbose    # Detailed test output for debugging
```

## 📁 Project Architecture

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # Server-side API endpoints
│   │   ├── photos/        # Mars rover photo endpoints
│   │   └── weather/       # Weather data endpoints
├── features/               # Domain-specific modules
│   ├── mars-time/         # Time calculations and real-time clock
│   ├── weather/           # Weather dashboard and data services
│   └── photos/           # Photo galleries and camera data
├── components/            # Reusable UI components
├── lib/                   # Shared utilities and constants
├── types/                 # TypeScript type definitions
└── __tests__/            # Comprehensive test suite (16 files, 186 tests)
```

### Key Design Decisions

- **Feature-Sliced Architecture**: Modular, scalable code organization by domain
- **Server/Client Split**: Optimal performance with Next.js App Router patterns
- **Pure Functions**: All time calculations and data transformations are testable
- **API Resilience**: Multi-layered fallback strategies for NASA API reliability
- **Type Safety**: Comprehensive TypeScript coverage with strict configuration
- **Performance First**: ISR, caching, and optimized bundle splitting

## 🌟 Portfolio Highlights

### Technical Excellence

- **Production-Ready Architecture**: Multi-service API integration with resilient error handling
- **Type Safety**: Strict TypeScript configuration with comprehensive interfaces
- **Testing Excellence**: 186 tests with MSW for realistic API mocking
- **Performance**: Optimized builds, ISR, and sub-3s load times
- **Accessibility**: WCAG 2.1 AA compliance with full keyboard navigation
- **Error Monitoring**: Sentry integration for production error tracking

### Code Quality Indicators

- Zero ESLint errors with strict configuration and custom rules
- Automated quality gates with Husky, lint-staged, and commitlint
- Comprehensive CI/CD pipeline with GitHub Actions and Lighthouse CI
- Professional documentation and inline code comments
- Real-time monitoring and performance tracking

## 🔮 Future Enhancements

- **Enhanced Data Export**: CSV/JSON download for weather history and photos
- **Advanced Analytics**: Machine learning insights on weather patterns
- **3D Visualization**: Interactive Mars globe with rover positions and trajectories
- **Mobile App**: React Native version for iOS/Android
- **Offline Support**: PWA capabilities with service worker caching
- **Real-time Notifications**: Weather alerts and mission updates

## 👨‍💻 Author

**Jim McQuillan**

- 🌐 GitHub: [@jimmcq](https://github.com/jimmcq)
- 💼 LinkedIn: [jimmcquillan](https://linkedin.com/in/jimmcquillan/)

## 🤝 Contributing

This is a portfolio project, but feedback and suggestions are welcome! Feel free to:

- Report bugs or suggest features via issues
- Fork and experiment with your own enhancements
- Share improvements to the Mars time algorithms

## 📝 License

MIT License © 2025 Jim McQuillan

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

**Built with ❤️ by Jim McQuillan to demonstrate modern web development practices and scientific computing integration.**
