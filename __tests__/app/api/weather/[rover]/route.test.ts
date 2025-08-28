/**
 * Tests for weather API route
 */

// Mock Next.js server environment
global.Request = class MockRequest {
  url: string;
  
  constructor(url: string) {
    this.url = url;
  }
  
  get nextUrl() {
    const url = new URL(this.url);
    return {
      searchParams: url.searchParams
    };
  }
} as any;

import { GET } from '@/app/api/weather/[rover]/route';

// Mock WeatherService
jest.mock('@/features/weather/weather-service', () => ({
  WeatherService: {
    getWeatherData: jest.fn(),
  },
}));

import { WeatherService } from '@/features/weather/weather-service';

const mockWeatherService = WeatherService as jest.Mocked<typeof WeatherService>;

describe('/api/weather/[rover]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns weather data for valid rover', async () => {
      const mockWeatherData = {
        data: {
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
        },
        meta: {
          totalSols: 1,
          requestTime: '2024-01-01T00:00:00Z',
          cached: false,
        },
      };

      mockWeatherService.getWeatherData.mockResolvedValue(mockWeatherData);

      const request = new global.Request('http://localhost:3000/api/weather/curiosity') as any;
      const params = { rover: 'curiosity' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockWeatherData);
      expect(mockWeatherService.getWeatherData).toHaveBeenCalledWith('curiosity', {});
    });

    it('handles query parameters correctly', async () => {
      const mockWeatherData = {
        data: {
          latest: {
            sol: 1000,
            earthDate: '2021-03-01',
            temperature: {
              min: -85,
              max: -15,
              average: -50,
              unit: 'celsius' as const,
              quality: 'complete' as const,
            },
            atmosphere: {
              pressure: 850,
              unit: 'pa' as const,
              quality: 'complete' as const,
            },
            rover: 'perseverance' as const,
            instrument: 'MEDA',
            dataQuality: 'complete' as const,
            location: {
              latitude: 18.4447,
              longitude: 77.4509,
              landingDate: '2021-02-18T20:55:00Z',
              locationName: 'Jezero Crater',
            },
            lastUpdated: '2021-03-01T00:00:00Z',
          },
          history: [],
          rover: 'perseverance' as const,
          lastFetch: '2021-03-01T00:00:00Z',
          status: 'success' as const,
        },
        meta: {
          totalSols: 1,
          requestTime: '2021-03-01T00:00:00Z',
          cached: false,
        },
      };

      mockWeatherService.getWeatherData.mockResolvedValue(mockWeatherData);

      const request = new global.Request(
        'http://localhost:3000/api/weather/perseverance?historyDays=14&temperatureUnit=fahrenheit'
      ) as any;
      const params = { rover: 'perseverance' };

      const response = await GET(request, { params });

      expect(response.status).toBe(200);
      expect(mockWeatherService.getWeatherData).toHaveBeenCalledWith('perseverance', {
        historyDays: 14,
        temperatureUnit: 'fahrenheit',
      });
    });

    it('returns 400 for invalid rover', async () => {
      const request = new global.Request('http://localhost:3000/api/weather/invalid') as any;
      const params = { rover: 'invalid' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid rover name');
      expect(mockWeatherService.getWeatherData).not.toHaveBeenCalled();
    });

    it('handles service errors gracefully', async () => {
      mockWeatherService.getWeatherData.mockRejectedValue(new Error('Service unavailable'));

      const request = new global.Request('http://localhost:3000/api/weather/curiosity') as any;
      const params = { rover: 'curiosity' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch weather data');
      expect(data.details).toBe('Service unavailable');
    });

    it('handles invalid query parameters', async () => {
      const mockWeatherData = {
        data: {
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
        },
        meta: {
          totalSols: 1,
          requestTime: '2024-01-01T00:00:00Z',
          cached: false,
        },
      };

      mockWeatherService.getWeatherData.mockResolvedValue(mockWeatherData);

      const request = new global.Request(
        'http://localhost:3000/api/weather/curiosity?historyDays=invalid&temperatureUnit=invalid'
      ) as any;
      const params = { rover: 'curiosity' };

      const response = await GET(request, { params });

      expect(response.status).toBe(200);
      // Should use default values when invalid parameters are provided
      expect(mockWeatherService.getWeatherData).toHaveBeenCalledWith('curiosity', {});
    });
  });
});