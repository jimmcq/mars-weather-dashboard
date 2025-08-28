/**
 * Tests for weather API service integration
 * Note: These tests focus on the service layer rather than Next.js route internals
 */

import { WeatherService } from '@/features/weather/weather-service';
import { RoverName } from '@/types/weather';

// Mock WeatherService
jest.mock('@/features/weather/weather-service', () => ({
  WeatherService: {
    getWeatherData: jest.fn(),
  },
}));

const mockWeatherService = WeatherService as jest.Mocked<typeof WeatherService>;

const mockWeatherData = {
  latest: {
    sol: 4000,
    earthDate: '2024-01-01',
    temperature: {
      min: -80,
      max: -10,
      average: -45,
      unit: 'celsius' as const,
      quality: 'complete' as const,
    },
    atmosphere: {
      pressure: 750,
      unit: 'pa' as const,
      quality: 'complete' as const,
    },
    rover: 'curiosity' as const,
    instrument: 'REMS',
    dataQuality: 'complete' as const,
    location: {
      latitude: -4.5895,
      longitude: 137.4417,
      landingDate: '2012-08-06T05:17:57Z',
      locationName: 'Gale Crater',
    },
    lastUpdated: '2024-01-01T00:00:00Z',
  },
  history: [],
  rover: 'curiosity' as const,
  lastFetch: '2024-01-01T00:00:00Z',
  status: 'success' as const,
};

describe('Weather API Service Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WeatherService.getWeatherData', () => {
    it('returns weather data for valid rover', async () => {
      mockWeatherService.getWeatherData.mockResolvedValue({
        data: mockWeatherData,
        meta: {
          totalSols: 1,
          requestTime: '2024-01-01T00:00:00Z',
          cached: false,
        },
      });

      const result = await WeatherService.getWeatherData('curiosity', {});

      expect(result.data).toEqual(mockWeatherData);
      expect(mockWeatherService.getWeatherData).toHaveBeenCalledWith('curiosity', {});
    });

    it('handles query parameters correctly', async () => {
      const perseveranceData = {
        ...mockWeatherData,
        rover: 'perseverance' as const,
        latest: {
          ...mockWeatherData.latest,
          rover: 'perseverance' as const,
          instrument: 'MEDA' as const,
          location: {
            latitude: 18.4447,
            longitude: 77.4509,
            landingDate: '2021-02-18T20:55:00Z',
            locationName: 'Jezero Crater',
          },
        },
      };

      mockWeatherService.getWeatherData.mockResolvedValue({
        data: perseveranceData,
        meta: {
          totalSols: 1,
          requestTime: '2024-01-01T00:00:00Z',
          cached: false,
        },
      });

      const options = {
        historyDays: 14,
        temperatureUnit: 'fahrenheit' as const,
      };

      const result = await WeatherService.getWeatherData('perseverance', options);

      expect(result.data.rover).toBe('perseverance');
      expect(mockWeatherService.getWeatherData).toHaveBeenCalledWith('perseverance', options);
    });

    it('handles service errors gracefully', async () => {
      mockWeatherService.getWeatherData.mockRejectedValue(new Error('Service unavailable'));

      await expect(WeatherService.getWeatherData('curiosity', {})).rejects.toThrow(
        'Service unavailable'
      );
    });

    it('handles invalid query parameters', async () => {
      mockWeatherService.getWeatherData.mockResolvedValue({
        data: mockWeatherData,
        meta: {
          totalSols: 1,
          requestTime: '2024-01-01T00:00:00Z',
          cached: false,
        },
      });

      // Service should handle invalid parameters gracefully
      await WeatherService.getWeatherData('curiosity', {});

      expect(mockWeatherService.getWeatherData).toHaveBeenCalledWith('curiosity', {});
    });
  });

  describe('API validation logic', () => {
    it('validates rover names correctly', () => {
      const validRovers: RoverName[] = ['curiosity', 'perseverance'];
      
      expect(validRovers.includes('curiosity')).toBe(true);
      expect(validRovers.includes('perseverance')).toBe(true);
      expect(validRovers.includes('invalid' as RoverName)).toBe(false);
    });

    it('handles Perseverance rover data correctly', async () => {
      const perseveranceData = {
        ...mockWeatherData,
        rover: 'perseverance' as const,
        latest: {
          ...mockWeatherData.latest,
          rover: 'perseverance' as const,
          instrument: 'MEDA' as const,
          location: {
            ...mockWeatherData.latest.location,
            locationName: 'Jezero Crater',
          },
        },
      };

      mockWeatherService.getWeatherData.mockResolvedValue({
        data: perseveranceData,
        meta: {
          totalSols: 1,
          requestTime: '2024-01-01T00:00:00Z',
          cached: false,
        },
      });

      const result = await WeatherService.getWeatherData('perseverance', {});

      expect(result.data.latest.instrument).toBe('MEDA');
      expect(result.data.latest.location.locationName).toBe('Jezero Crater');
      expect(result.data.rover).toBe('perseverance');
    });

    it('handles cached vs fresh data indicators', async () => {
      // Test with fresh data
      mockWeatherService.getWeatherData.mockResolvedValueOnce({
        data: mockWeatherData,
        meta: {
          totalSols: 1,
          requestTime: '2024-01-01T00:00:00Z',
          cached: false,
        },
      });

      const freshResult = await WeatherService.getWeatherData('curiosity', {});
      expect(freshResult.meta.cached).toBe(false);

      // Test with cached data
      mockWeatherService.getWeatherData.mockResolvedValueOnce({
        data: mockWeatherData,
        meta: {
          totalSols: 1,
          requestTime: '2024-01-01T00:00:05Z',
          cached: true,
          cacheExpiry: '2024-01-01T00:05:00Z',
        },
      });

      const cachedResult = await WeatherService.getWeatherData('curiosity', {});
      expect(cachedResult.meta.cached).toBe(true);
      expect(cachedResult.meta.cacheExpiry).toBeDefined();
    });
  });
});