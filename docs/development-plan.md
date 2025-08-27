### **The Final Plan: A Portfolio-Grade Mars Dashboard**

**Tech Stack:**

- **Framework:** Next.js (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **State Management:** TanStack Query (React Query)
- **Testing:** Jest, React Testing Library, and **Mock Service Worker (MSW)**
- **UI Polish:** Framer Motion (for subtle animations), `lucide-react` (for icons)
- **CI/CD & Deployment:** GitHub Actions & Vercel

---

### **Phase 1: The Bedrock (Foundation & Setup)**

**(Goal: Establish a professional-grade project structure and automated quality gates from day one.)**

1.  **Project Initialization:**
    - Initialize the project and install all dependencies in one go.

    ```bash
    # 1. Create the Next.js project
    npx create-next-app@latest mars-dashboard --typescript --tailwind --eslint --app

    # 2. Enter the directory
    cd mars-dashboard

    # 3. Install dev dependencies for quality and testing
    npm i -D prettier husky lint-staged @testing-library/jest-dom jest-environment-jsdom msw

    # 4. Install app dependencies
    npm i @tanstack/react-query framer-motion lucide-react date-fns
    ```

2.  **Code Structure (The Architecture):**
    - This structure is designed for scalability and clear separation of concerns.

    ```
    src/
    ├── app/                     # Routing, layouts, and pages.
    │   └── api/                 # **Route Handlers to act as a secure proxy to NASA APIs.**
    ├── components/              # **Dumb, reusable UI components (e.g., Button, Card, Icon).**
    ├── features/                # **Smart, domain-specific modules.**
    │   ├── MarsWeather/         # Contains WeatherDashboard.tsx, useMarsWeather.ts, etc.
    │   └── MartianClock/        # Contains MartianClock.tsx, useMartianClock.ts, etc.
    ├── lib/                     # **External service clients (e.g., nasa-client.ts).**
    ├── utils/                   # **Pure, shared helper functions (e.g., time-conversion.ts).**
    ├── types/                   # Shared TypeScript type definitions (e.g., weather.ts).
    └── __tests__/               # All test files and mocks.
    ```

3.  **Automation & Quality Gates:**
    - Configure **ESLint + Prettier** for consistent formatting.
    - Set up **Husky + lint-staged** to automatically lint and format code before every commit.
    - Create a basic `.github/workflows/ci.yml` file to run tests on every pull request.

---

### **Phase 2: The Engine (Data Layer & Core Logic)**

**(Goal: Build a resilient and type-safe data fetching layer, fully testable without hitting live APIs.)**

1.  **Secure API Proxy:**
    - In `/app/api/weather/[rover]/route.ts`, create a Next.js Route Handler.
    - This handler will fetch data from the real NASA API using an API key stored securely in environment variables (`process.env.NASA_API_KEY`).
    - **This is a key portfolio pattern:** It demonstrates you know how to protect sensitive credentials.

2.  **Data Normalization & Typing:**
    - Define a single, unified `MarsWeatherSol` interface in `/types/weather.ts`.
    - Your API proxy will be responsible for transforming the raw, inconsistent data from different NASA sources into this clean, predictable shape before sending it to the client.

3.  **Testing with Mock Service Worker (MSW):**
    - Set up MSW to intercept all `fetch` requests during tests.
    - Create mock responses that mimic the real NASA API.
    - **This is a major differentiator:** It allows you to test your entire data fetching pipeline—from the service call to the component rendering—in a controlled environment.

---

### **Phase 3: The Cockpit (UI & Component Development)**

**(Goal: Create a polished, responsive, and interactive user interface.)**

1.  **Build the Time Module:**
    - In `/utils/time-conversion.ts`, write the pure functions for Earth-to-Mars time calculations.
    - Aim for **100% test coverage** on this file. It's a perfect, self-contained example of your attention to detail.

2.  **Develop Feature Components:**
    - In `/features/MartianClock`, create the `<MartianClock />` component and a `useMartianClock` hook to provide the real-time data.
    - In `/features/MarsWeather`, create the main `<WeatherDashboard />`. This "smart" component will use a `useMarsWeather` hook (powered by TanStack Query) to fetch data from your `/api/weather/...` endpoint.

3.  **UI Polish:**
    - Use `Framer Motion` to add subtle, professional animations (e.g., fade-in on load, layout animations when switching rovers).
    - Use `lucide-react` for clean, consistent icons.
    - Implement **loading skeletons** while TanStack Query is fetching data in the background.
    - Design clear and helpful **error state UI** for when API calls fail.

---

### **Phase 4: The Launch (Final Polish & Documentation)**

**(Goal: Ensure the project is presented as a finished, professional product.)**

1.  **The README.md - Your Project's Front Door:**
    - This is the most critical part of a portfolio project. It must be exceptional.
    - **Include:**
      - A clear **Title** and a short, compelling **Description**.
      - An animated **GIF or high-quality screenshot** of the final application.
      - A prominent link to the **Live Demo** on Vercel.
      - A **Features** section listing what the app can do.
      - A **Tech Stack** section with badges for the technologies used.
      - An **Architecture Decisions** section briefly explaining _why_ you chose key patterns (e.g., "Why a Server-Side API Proxy? To protect API keys...").
      - Clear **Local Setup** instructions.

2.  **Final Checks:**
    - **Accessibility:** Use browser tools to audit for a11y issues. Ensure full keyboard navigation.
    - **Responsiveness:** Test on various screen sizes, from mobile to desktop.
    - **Performance:** Run a Lighthouse audit and aim for scores above 90.

3.  **Deploy:**
    - Push your final code to GitHub. Your CI pipeline will run.
    - Connect your repository to **Vercel** for a seamless, continuous deployment.
