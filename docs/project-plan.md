# Mars Weather Dashboard - Portfolio Project Plan

## Project Vision

A production-quality web application showcasing senior-level full-stack development skills through Mars weather data visualization and real-time Martian time calculations.

## Why This Makes a Great Portfolio Piece

- **Technical Depth:** Demonstrates complex time calculations, data normalization, and API integration
- **Modern Stack:** Next.js 14 App Router, Server Components, TypeScript
- **Professional Standards:** Comprehensive testing, CI/CD, accessibility
- **Visual Appeal:** Space themes are inherently engaging
- **Real Data:** Shows ability to work with external APIs and handle edge cases

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS with custom design system
- **Data Management:** TanStack Query + Server Components
- **Testing:** Jest, React Testing Library, MSW for API mocking
- **CI/CD:** GitHub Actions + Vercel
- **Monitoring:** Vercel Analytics (free tier)

---

## Phase 1: Professional Foundation (Day 1-2)

### Project Setup

```bash
npx create-next-app@latest mars-weather-dashboard --typescript --tailwind --app
cd mars-weather-dashboard

# Quality tooling
npm i -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm i -D prettier eslint-config-prettier prettier-plugin-tailwindcss
npm i -D husky lint-staged @commitlint/cli @commitlint/config-conventional

# Testing suite
npm i -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
npm i -D msw@latest whatwg-fetch

# Core dependencies
npm i @tanstack/react-query axios date-fns
npm i framer-motion recharts
```

### Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home page (Server Component)
│   ├── error.tsx            # Error boundary
│   ├── loading.tsx          # Loading state
│   └── api/
│       └── weather/         # API routes for secure fetching
├── components/              # Reusable UI components
│   ├── ui/                 # Base components (Button, Card, etc.)
│   └── charts/             # Data visualization components
├── features/               # Domain-specific modules
│   ├── weather/
│   │   ├── components/     # Weather-specific components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API integration
│   │   └── types.ts        # Weather types
│   └── mars-time/
│       ├── components/     # Clock components
│       ├── hooks/          # Time hooks
│       └── utils.ts        # Pure calculation functions
├── lib/                    # Core utilities
│   ├── api-client.ts      # Axios instance
│   └── constants.ts       # App constants
├── styles/                # Global styles
├── types/                 # Shared TypeScript types
└── __tests__/            # Test setup and utilities
```

### Configuration Excellence

```typescript
// tsconfig.json - Strict TypeScript
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Git Hooks Setup

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## Phase 2: Data Architecture (Day 3-5)

### API Strategy

#### Primary Data Sources

```typescript
// Server-side API route: app/api/weather/[rover]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { rover: 'curiosity' | 'perseverance' } }
) {
  // Fetch from NASA with server-side API key
  // Transform to normalized format
  // Cache with appropriate headers
}
```

#### Data Normalization

```typescript
// types/weather.ts
export interface NormalizedSolData {
  sol: number;
  earthDate: string;
  temperature: Temperature;
  atmosphere: AtmosphericData;
  wind?: WindData;
  rover: RoverName;
  instrument: InstrumentName;
  dataQuality: 'complete' | 'partial' | 'estimated';
}

// Transform various NASA formats into this single interface
```

#### Fallback Strategy

1. Live NASA API (when available)
2. NASA Open Data Portal CSV
3. Static JSON snapshots (updated weekly)
4. Graceful degradation messaging

### Testing the Data Layer

```typescript
// __tests__/api/weather.test.ts
import { server } from '@/mocks/server';
import { rest } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('transforms REMS data correctly', async () => {
  server.use(
    rest.get('*/api/weather/curiosity', (req, res, ctx) => {
      return res(ctx.json(mockREMSData));
    })
  );
  // Test transformation logic
});
```

---

## Phase 3: Mars Time Engine (Day 6-7)

### Pure Function Implementation

```typescript
// features/mars-time/utils.ts
export const MarsTimeCalculator = {
  // Based on NASA Mars24 algorithm
  earthToMSD(date: Date): number {
    // Mars Sol Date calculation
  },

  getMTC(date: Date, longitude: number): string {
    // Coordinated Mars Time
  },

  getSolNumber(landingDate: Date, currentDate: Date): number {
    // Mission sol calculation
  },
};

// 100% test coverage required for this module
```

### Real-time Hook

```typescript
// features/mars-time/hooks/useMarsTime.ts
export function useMarsTime(options?: MarsTimeOptions) {
  const [time, setTime] = useState<MarsTimeData>();

  useEffect(() => {
    const calculate = () => {
      // Calculate for both rover locations
      // Update every second
    };

    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [options]);

  return time;
}
```

---

## Phase 4: UI Components (Day 8-11)

### Component Architecture

#### Server Components (Data Fetching)

```tsx
// app/page.tsx
export default async function HomePage() {
  // This runs on the server
  const weatherData = await getLatestWeatherData();

  return <WeatherDashboard initialData={weatherData} />;
}
```

#### Client Components (Interactivity)

```tsx
// features/weather/components/WeatherDashboard.tsx
'use client';

export function WeatherDashboard({ initialData }) {
  const { data, isLoading } = useWeatherData(initialData);

  return (
    <div className="grid gap-6">
      <RoverSelector />
      <CurrentConditions data={data} />
      <HistoricalChart data={data} />
      <MartianClock />
    </div>
  );
}
```

### Visual Design System

- **Color Palette:** NASA-inspired with Mars red accents
- **Typography:** Monospace for data, clean sans for UI
- **Motion:** Subtle animations with Framer Motion
- **Charts:** Interactive Recharts visualizations

### Key Components

1. **WeatherCard:** Current conditions with animated transitions
2. **TemperatureChart:** 7-sol trend with hover details
3. **MartianClock:** Real-time dual location display
4. **RoverSelector:** Smooth transition between data sources
5. **DataQualityBadge:** Shows data freshness/reliability

---

## Phase 5: Polish & Portfolio Ready (Day 12-14)

### Performance Optimization

- Implement `loading.tsx` with skeleton screens
- Add `error.tsx` boundary with retry
- Configure TanStack Query for optimal caching
- Image optimization for rover photos

### Accessibility Checklist

- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation throughout
- [ ] Screen reader announcements for updates
- [ ] Focus management on route changes
- [ ] Color contrast ratios > 4.5:1

### Testing Coverage

```bash
# Target metrics
- Statements: 85%+
- Branches: 80%+
- Functions: 90%+
- Lines: 85%+
- Mars time utils: 100%
```

### Documentation

```markdown
# README.md structure

- Hero image/GIF
- Live demo link
- Tech stack badges
- Quick start guide
- Architecture diagram
- API documentation
- Testing approach
- Performance metrics
```

### CI/CD Pipeline

```yaml
# .github/workflows/main.yml
- TypeScript checking
- ESLint/Prettier verification
- Jest test suite
- Build verification
- Lighthouse CI
- Auto-deploy to Vercel
```

---

## Portfolio Differentiators

### Technical Excellence

- **Server Components:** Shows understanding of latest Next.js patterns
- **Type Safety:** Strict TypeScript throughout
- **Testing:** Professional-grade coverage
- **Error Handling:** Graceful degradation at every level

### Code Quality Indicators

```typescript
// Example of clean, testable code
export function calculateMarsTemperature(
  celsius: number,
  options?: TemperatureOptions
): TemperatureReading {
  // Pure function with no side effects
  // Comprehensive JSDoc
  // Guard clauses for edge cases
  // Clear naming conventions
}
```

### Visual Polish

- Custom loading animations
- Smooth data transitions
- Mobile-first responsive design
- Dark mode with theme switcher

### Beyond MVP Features

- **Data Export:** Download weather history as CSV
- **Comparison Mode:** Side-by-side rover data
- **Weather Alerts:** Dust storm notifications
- **Share Feature:** Social media cards

---

## Success Metrics for Portfolio

### Technical Metrics

- [ ] Lighthouse Performance Score > 95
- [ ] Zero TypeScript errors
- [ ] Zero accessibility violations
- [ ] Sub-3 second load time
- [ ] Works offline after first visit

### Portfolio Impact

- [ ] Clear value proposition in README
- [ ] Live demo that works reliably
- [ ] Code that demonstrates seniority
- [ ] Git history showing iterative development
- [ ] Comprehensive test suite visible in repo

### Talking Points for Interviews

- Handling unreliable external APIs
- Server vs Client component decisions
- Complex time calculation implementation
- Performance optimization strategies
- Testing philosophy and approach

---

## Quick Reference

### Development Commands

```bash
npm run dev          # Start development server
npm run test:watch   # Run tests in watch mode
npm run test:ci      # Run full test suite with coverage
npm run type-check   # TypeScript validation
npm run lint:fix     # Fix linting issues
npm run build        # Production build
npm run analyze      # Bundle analysis
```

### Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] API rate limits considered
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] README polished

This project demonstrates not just coding ability, but architecture thinking, testing discipline, and attention to user experience - exactly what senior roles require.
