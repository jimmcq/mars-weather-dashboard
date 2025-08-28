/**
 * API resilience utilities
 * Provides retry logic, circuit breakers, and timeout handling
 */

/**
 * Retry configuration options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial delay between retries in milliseconds */
  initialDelayMs: number;
  /** Maximum delay between retries in milliseconds */
  maxDelayMs: number;
  /** Backoff multiplier for exponential backoff */
  backoffMultiplier: number;
  /** Timeout for each request in milliseconds */
  timeoutMs: number;
  /** Function to determine if error should trigger retry */
  shouldRetry?: (error: Error) => boolean;
  /** Callback for retry attempts */
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Circuit breaker state
 */
interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  timeoutMs: 30000,
  shouldRetry: (error: Error) => {
    // Retry on network errors, timeouts, and 5xx status codes
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504')
    );
  },
};

/**
 * Circuit breaker configuration
 */
interface CircuitBreakerOptions {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time to wait before attempting reset (ms) */
  resetTimeoutMs: number;
  /** Time window for counting failures (ms) */
  windowMs: number;
}

const DEFAULT_CIRCUIT_BREAKER_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeoutMs: 60000, // 1 minute
  windowMs: 300000, // 5 minutes
};

/**
 * Circuit breaker registry
 */
const circuitBreakers = new Map<string, CircuitBreakerState>();

/**
 * API Resilience utilities
 */
export class ApiResilience {
  /**
   * Execute function with retry logic and exponential backoff
   * @param fn - Async function to execute
   * @param options - Retry configuration options
   * @returns Promise with function result
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
    let lastError: Error;
    let delay = config.initialDelayMs;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        // Execute with timeout
        const result = await Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error('Request timeout')),
              config.timeoutMs
            )
          ),
        ]);

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on the last attempt
        if (attempt === config.maxAttempts) {
          break;
        }

        // Check if we should retry this error
        if (config.shouldRetry && !config.shouldRetry(lastError)) {
          throw lastError;
        }

        // Call retry callback
        config.onRetry?.(attempt, lastError);

        // Wait before retrying with exponential backoff
        await this.delay(Math.min(delay, config.maxDelayMs));
        delay *= config.backoffMultiplier;

        // Add jitter to prevent thundering herd
        delay += Math.random() * 1000;
      }
    }

    throw lastError!;
  }

  /**
   * Execute function with circuit breaker pattern
   * @param fn - Async function to execute
   * @param circuitName - Unique name for the circuit
   * @param options - Circuit breaker options
   * @returns Promise with function result
   */
  static async withCircuitBreaker<T>(
    fn: () => Promise<T>,
    circuitName: string,
    options: Partial<CircuitBreakerOptions> = {}
  ): Promise<T> {
    const config = { ...DEFAULT_CIRCUIT_BREAKER_OPTIONS, ...options };
    const now = Date.now();

    let circuit = circuitBreakers.get(circuitName);
    if (!circuit) {
      circuit = {
        isOpen: false,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0,
      };
      circuitBreakers.set(circuitName, circuit);
    }

    // Check if circuit is open
    if (circuit.isOpen) {
      if (now < circuit.nextAttemptTime) {
        throw new Error(
          `Circuit breaker is open for ${circuitName}. Next attempt at ${new Date(
            circuit.nextAttemptTime
          ).toISOString()}`
        );
      }
      // Try to reset circuit (half-open state)
      circuit.isOpen = false;
    }

    try {
      const result = await fn();

      // Success - reset circuit
      circuit.failureCount = 0;
      circuit.lastFailureTime = 0;

      return result;
    } catch (error) {
      // Failure - update circuit state
      circuit.lastFailureTime = now;

      // Only count failures within the time window
      if (now - circuit.lastFailureTime < config.windowMs) {
        circuit.failureCount++;
      } else {
        circuit.failureCount = 1; // Reset count for new time window
      }

      // Open circuit if threshold exceeded
      if (circuit.failureCount >= config.failureThreshold) {
        circuit.isOpen = true;
        circuit.nextAttemptTime = now + config.resetTimeoutMs;
      }

      throw error;
    }
  }

  /**
   * Execute function with both retry and circuit breaker
   * @param fn - Async function to execute
   * @param circuitName - Unique name for the circuit
   * @param retryOptions - Retry configuration
   * @param circuitOptions - Circuit breaker configuration
   * @returns Promise with function result
   */
  static async withResiliencePattern<T>(
    fn: () => Promise<T>,
    circuitName: string,
    retryOptions: Partial<RetryOptions> = {},
    circuitOptions: Partial<CircuitBreakerOptions> = {}
  ): Promise<T> {
    return this.withCircuitBreaker(
      () => this.withRetry(fn, retryOptions),
      circuitName,
      circuitOptions
    );
  }

  /**
   * Create a resilient fetch function
   * @param url - URL to fetch
   * @param options - Fetch options
   * @param resilience - Resilience configuration
   * @returns Promise with fetch response
   */
  static async resilientFetch(
    url: string,
    options: RequestInit = {},
    resilience: {
      circuitName?: string;
      retryOptions?: Partial<RetryOptions>;
      circuitOptions?: Partial<CircuitBreakerOptions>;
    } = {}
  ): Promise<Response> {
    const fetchFn = async (): Promise<Response> => {
      const response = await fetch(url, options);

      // Consider 4xx errors as non-retryable
      if (response.status >= 400 && response.status < 500) {
        throw new Error(
          `Client error: ${response.status} ${response.statusText}`
        );
      }

      // Consider 5xx errors as retryable
      if (response.status >= 500) {
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      return response;
    };

    const circuitName =
      resilience.circuitName || `fetch-${new URL(url).hostname}`;

    return this.withResiliencePattern(
      fetchFn,
      circuitName,
      resilience.retryOptions,
      resilience.circuitOptions
    );
  }

  /**
   * Get circuit breaker status for debugging
   * @param circuitName - Circuit name to check
   * @returns Circuit breaker state or null if not found
   */
  static getCircuitStatus(circuitName: string): CircuitBreakerState | null {
    return circuitBreakers.get(circuitName) || null;
  }

  /**
   * Reset circuit breaker state
   * @param circuitName - Circuit name to reset
   */
  static resetCircuit(circuitName: string): void {
    circuitBreakers.delete(circuitName);
  }

  /**
   * Utility method to create delay
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Health check utility
   * @param urls - Array of URLs to check
   * @returns Health status of each URL
   */
  static async healthCheck(urls: string[]): Promise<
    Array<{
      url: string;
      status: 'healthy' | 'unhealthy' | 'unknown';
      responseTime: number;
      error?: string;
    }>
  > {
    const results = await Promise.allSettled(
      urls.map(async (url) => {
        const startTime = Date.now();
        try {
          const response = await this.resilientFetch(
            url,
            { method: 'HEAD' },
            {
              retryOptions: { maxAttempts: 1, timeoutMs: 5000 },
            }
          );

          return {
            url,
            status: response.ok ? ('healthy' as const) : ('unhealthy' as const),
            responseTime: Date.now() - startTime,
          };
        } catch (error) {
          return {
            url,
            status: 'unhealthy' as const,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          url: urls[index]!,
          status: 'unknown' as const,
          responseTime: 0,
          error:
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason),
        };
      }
    });
  }
}
