/**
 * Weather data hook for Mars rover environmental data
 * Provides real-time weather information with caching and error handling
 */

'use client';

import { useState, useEffect } from 'react';
import {
  RoverName,
  MarsWeatherData,
  WeatherDataOptions,
} from '@/types/weather';

/** Hook options for weather data fetching */
export interface UseWeatherDataOptions extends WeatherDataOptions {
  /** Update interval in milliseconds */
  updateInterval?: number;
  /** Enable automatic refetching */
  autoRefetch?: boolean;
  /** Initial data for SSR hydration */
  initialData?: MarsWeatherData | null;
}

/** Hook return type */
export interface UseWeatherDataReturn {
  /** Weather data */
  data: MarsWeatherData | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Refetch function */
  refetch: () => Promise<void>;
  /** Last fetch timestamp */
  lastFetch: string | null;
}

/**
 * Custom hook for fetching Mars weather data
 * Follows the same patterns as useMartianTime for consistency
 */
export function useWeatherData(
  rover: RoverName,
  options: UseWeatherDataOptions = {}
): UseWeatherDataReturn {
  const {
    updateInterval = 5 * 60 * 1000, // 5 minutes default
    autoRefetch = true,
    initialData = null,
    ...weatherOptions
  } = options;

  const [data, setData] = useState<MarsWeatherData | null>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string | null>(null);

  /**
   * Fetch weather data from API
   */
  const fetchWeatherData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (weatherOptions.historyDays) {
        params.append('history', weatherOptions.historyDays.toString());
      }
      if (weatherOptions.temperatureUnit) {
        params.append('tempUnit', weatherOptions.temperatureUnit);
      }
      if (weatherOptions.pressureUnit) {
        params.append('pressureUnit', weatherOptions.pressureUnit);
      }
      if (weatherOptions.windUnit) {
        params.append('windUnit', weatherOptions.windUnit);
      }
      if (weatherOptions.includeEstimated) {
        params.append('includeEstimated', 'true');
      }

      const queryString = params.toString();
      const url = `/api/weather/${rover}${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        // Use cache for performance
        cache: 'force-cache',
        next: { revalidate: 300 }, // 5 minutes
      });

      if (!response.ok) {
        // Try to extract error message from response
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If we can't parse error, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();

      // Handle API error responses
      if ('error' in responseData) {
        throw new Error(responseData.error);
      }

      // Extract weather data from API response
      const weatherData = responseData.data || responseData;

      setData(weatherData);
      setLastFetch(new Date().toISOString());
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch weather data';
      console.error('Weather data fetch error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manual refetch function
   */
  const refetch = async (): Promise<void> => {
    await fetchWeatherData();
  };

  /**
   * Set up automatic fetching and intervals
   */
  useEffect(() => {
    // Initial fetch if no initial data
    if (!initialData) {
      fetchWeatherData();
    }

    // Set up auto-refetch interval if enabled
    let intervalId: NodeJS.Timeout | null = null;

    if (autoRefetch && updateInterval > 0) {
      intervalId = setInterval(fetchWeatherData, updateInterval);
    }

    // Cleanup interval on unmount or dependency change
    return (): void => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rover,
    autoRefetch,
    updateInterval,
    weatherOptions.historyDays,
    weatherOptions.temperatureUnit,
    weatherOptions.pressureUnit,
    weatherOptions.windUnit,
    weatherOptions.includeEstimated,
  ]);

  /**
   * Handle browser focus/visibility changes
   * Refetch data when user returns to tab
   */
  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (!document.hidden && autoRefetch) {
        // Only refetch if data is stale (older than half the update interval)
        const staleThreshold = updateInterval / 2;
        const isStale = lastFetch
          ? Date.now() - new Date(lastFetch).getTime() > staleThreshold
          : true;

        if (isStale) {
          fetchWeatherData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return (): void => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefetch, updateInterval, lastFetch]);

  return {
    data,
    isLoading,
    error,
    refetch,
    lastFetch,
  };
}
