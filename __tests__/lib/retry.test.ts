/**
 * Tests for API resilience utilities
 */

import { ApiResilience } from '@/lib/retry';

// Mock Response constructor for Node.js environment
class MockResponse {
  ok: boolean;
  status: number;
  statusText: string;
  body: string;

  constructor(
    body: string,
    init: { status?: number; statusText?: string } = {}
  ) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.ok = this.status >= 200 && this.status < 300;
  }

  async text(): Promise<string> {
    return this.body;
  }

  async json(): Promise<unknown> {
    return JSON.parse(this.body);
  }
}

// Assign to global for tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Response = MockResponse;

describe('ApiResilience', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset circuit breakers between tests
    const circuits = [
      'test-circuit',
      'failing-circuit',
      'reset-circuit',
      'status-test',
      'reset-test',
    ];
    circuits.forEach((name) => ApiResilience.resetCircuit(name));
  });

  describe('withRetry', () => {
    test('succeeds on first attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await ApiResilience.withRetry(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('retries on failure and eventually succeeds', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('success');

      const onRetry = jest.fn();

      const result = await ApiResilience.withRetry(mockFn, {
        maxAttempts: 3,
        initialDelayMs: 1, // Very short delay for tests
        onRetry,
      });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
      expect(onRetry).toHaveBeenCalledTimes(2);
    }, 10000);

    test('fails after max attempts', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Persistent error'));

      await expect(
        ApiResilience.withRetry(mockFn, {
          maxAttempts: 2,
          initialDelayMs: 1,
          shouldRetry: () => true, // Ensure it retries
        })
      ).rejects.toThrow('Persistent error');

      expect(mockFn).toHaveBeenCalledTimes(2);
    }, 10000);

    test('respects shouldRetry predicate', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Client error'));

      await expect(
        ApiResilience.withRetry(mockFn, {
          maxAttempts: 3,
          shouldRetry: (error) => !error.message.includes('Client'),
        })
      ).rejects.toThrow('Client error');

      expect(mockFn).toHaveBeenCalledTimes(1); // No retry
    });

    test('handles timeout', async () => {
      const mockFn = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 1000))
        );

      await expect(
        ApiResilience.withRetry(mockFn, {
          timeoutMs: 50,
          maxAttempts: 1,
        })
      ).rejects.toThrow('Request timeout');
    }, 10000);
  });

  describe('withCircuitBreaker', () => {
    test('allows requests when circuit is closed', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await ApiResilience.withCircuitBreaker(
        mockFn,
        'test-circuit'
      );

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('opens circuit after failure threshold', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Service error'));

      // Make multiple failed requests to trip the circuit
      for (let i = 0; i < 5; i++) {
        try {
          await ApiResilience.withCircuitBreaker(mockFn, 'failing-circuit', {
            failureThreshold: 5,
          });
        } catch {
          // Expected failures
        }
      }

      // Circuit should now be open
      await expect(
        ApiResilience.withCircuitBreaker(mockFn, 'failing-circuit')
      ).rejects.toThrow('Circuit breaker is open');
    });

    test('resets on successful request', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Service error'))
        .mockResolvedValueOnce('success');

      // First call fails
      try {
        await ApiResilience.withCircuitBreaker(mockFn, 'reset-test-circuit');
      } catch {
        // Expected failure
      }

      // Second call succeeds and should reset failure count
      const result = await ApiResilience.withCircuitBreaker(
        mockFn,
        'reset-test-circuit'
      );

      expect(result).toBe('success');

      // Verify circuit state is reset
      const status = ApiResilience.getCircuitStatus('reset-test-circuit');
      expect(status?.failureCount).toBe(0);
    });
  });

  describe('resilientFetch', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    test('makes successful requests', async () => {
      const mockResponse = new MockResponse('{"data": "success"}', {
        status: 200,
      });

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await ApiResilience.resilientFetch(
        'https://api.example.com'
      );

      expect(result.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com', {});
    });

    test('throws on 4xx client errors without retry', async () => {
      const mockResponse = new MockResponse('Not Found', {
        status: 404,
        statusText: 'Not Found',
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        ApiResilience.resilientFetch('https://api.example.com')
      ).rejects.toThrow('Client error: 404');

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('retries on 5xx server errors', async () => {
      const mockResponse = new MockResponse('Internal Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        ApiResilience.resilientFetch(
          'https://api.example.com',
          {},
          {
            retryOptions: { maxAttempts: 2, initialDelayMs: 1 },
          }
        )
      ).rejects.toThrow('Server error: 500');

      expect(global.fetch).toHaveBeenCalledTimes(2);
    }, 10000);
  });

  describe('getCircuitStatus', () => {
    test('returns null for non-existent circuit', () => {
      const status = ApiResilience.getCircuitStatus('non-existent');
      expect(status).toBeNull();
    });

    test('returns circuit state after operations', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      await ApiResilience.withCircuitBreaker(mockFn, 'status-test');

      const status = ApiResilience.getCircuitStatus('status-test');
      expect(status).not.toBeNull();
      expect(status?.isOpen).toBe(false);
      expect(status?.failureCount).toBe(0);
    });
  });

  describe('resetCircuit', () => {
    test('removes circuit from registry', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      await ApiResilience.withCircuitBreaker(mockFn, 'reset-test');

      let status = ApiResilience.getCircuitStatus('reset-test');
      expect(status).not.toBeNull();

      ApiResilience.resetCircuit('reset-test');

      status = ApiResilience.getCircuitStatus('reset-test');
      expect(status).toBeNull();
    });
  });

  describe('healthCheck', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    test('checks multiple URLs', async () => {
      const urls = ['https://api1.example.com', 'https://api2.example.com'];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(new MockResponse('', { status: 200 }))
        .mockRejectedValueOnce(new Error('Network error'));

      const results = await ApiResilience.healthCheck(urls);

      expect(results).toHaveLength(2);
      expect(results[0]?.status).toBe('healthy');
      expect(results[1]?.status).toBe('unhealthy');
      expect(results[0]?.responseTime).toBeGreaterThanOrEqual(0);
      expect(results[1]?.error).toContain('Network error');
    });

    test('handles unhealthy responses', async () => {
      const urls = ['https://api.example.com'];

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        new MockResponse('', { status: 500 })
      );

      const results = await ApiResilience.healthCheck(urls);

      expect(results[0]?.status).toBe('unhealthy');
    });
  });
});
