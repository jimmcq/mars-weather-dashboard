import '@testing-library/jest-dom'

// Suppress console warnings/errors during tests for clean output
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  // Suppress React DOM development warnings about attributes (these are dev-only warnings, not real issues)
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Received `')) {
      return
    }
    if (typeof args[0] === 'string' && args[0].includes('validateProperty')) {
      return  
    }
    originalConsoleError.apply(console, args)
  }
  
  // Suppress other development warnings
  console.warn = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Mock fetch for tests with proper Response object
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    clone: () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    }),
    headers: new Headers(),
  })
)

// Reset fetch mock before each test
beforeEach(() => {
  global.fetch.mockClear()
})