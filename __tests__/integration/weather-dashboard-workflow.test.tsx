/**
 * Integration tests for Weather Dashboard workflow
 * Tests the complete user journey from data loading to error handling
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WeatherDashboard } from '@/features/weather/WeatherDashboard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
}));

// Mock the weather service
jest.mock('@/features/weather/weather-service', () => ({
  WeatherService: {
    getWeatherData: jest.fn(),
  },
}));

import { WeatherService } from '@/features/weather/weather-service';

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
    instrument: 'REMS' as const,
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

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Weather Dashboard Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('completes the full weather data loading workflow', async () => {
    mockWeatherService.getWeatherData.mockResolvedValue({
      data: mockWeatherData,
      meta: {
        totalSols: 1,
        requestTime: '2024-01-01T00:00:00Z',
        cached: false,
      },
    });

    render(
      <TestWrapper>
        <WeatherDashboard />
      </TestWrapper>
    );

    // Should show loading state initially
    expect(screen.getByText('Mars Weather Data')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Sol 4000 • 2024-01-01')).toBeInTheDocument();
    });

    // Should display temperature data
    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('-45°C')).toBeInTheDocument();
    expect(screen.getByText('High: -10°C')).toBeInTheDocument();
    expect(screen.getByText('Low: -80°C')).toBeInTheDocument();

    // Should display pressure data
    expect(screen.getByText('Atmospheric Pressure')).toBeInTheDocument();
    expect(screen.getByText('750 Pa')).toBeInTheDocument();

    // Should display location information
    expect(screen.getByText('Gale Crater')).toBeInTheDocument();
    expect(screen.getByText('Curiosity Rover')).toBeInTheDocument();
    expect(screen.getByText('REMS')).toBeInTheDocument();

    // Should show last updated information
    expect(screen.getByText(/last updated/i)).toBeInTheDocument();

    // Verify the service was called with correct parameters
    expect(mockWeatherService.getWeatherData).toHaveBeenCalledWith('curiosity', {});
  });

  it('handles the complete error recovery workflow', async () => {
    // First call fails
    mockWeatherService.getWeatherData.mockRejectedValueOnce(new Error('NASA API unavailable'));
    
    // Second call (retry) succeeds
    mockWeatherService.getWeatherData.mockResolvedValueOnce({
      data: mockWeatherData,
      meta: {
        totalSols: 1,
        requestTime: '2024-01-01T00:00:00Z',
        cached: false,
      },
    });

    render(
      <TestWrapper>
        <WeatherDashboard />
      </TestWrapper>
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Unable to Load Weather Data')).toBeInTheDocument();
    });

    expect(screen.getByText(/temporarily unavailable/)).toBeInTheDocument();
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();

    // Click retry button
    fireEvent.click(retryButton);

    // Wait for successful data load
    await waitFor(() => {
      expect(screen.getByText('Sol 4000 • 2024-01-01')).toBeInTheDocument();
    });

    // Should display weather data after retry
    expect(screen.getByText('-45°C')).toBeInTheDocument();
    expect(screen.getByText('750 Pa')).toBeInTheDocument();

    // Verify service was called twice (initial + retry)
    expect(mockWeatherService.getWeatherData).toHaveBeenCalledTimes(2);
  });

  it('displays wind data when available in the complete workflow', async () => {
    const weatherDataWithWind = {
      ...mockWeatherData,
      latest: {
        ...mockWeatherData.latest,
        wind: {
          speed: 12.5,
          direction: 270,
          unit: 'mps' as const,
          quality: 'complete' as const,
        },
      },
    };

    mockWeatherService.getWeatherData.mockResolvedValue({
      data: weatherDataWithWind,
      meta: {
        totalSols: 1,
        requestTime: '2024-01-01T00:00:00Z',
        cached: false,
      },
    });

    render(
      <TestWrapper>
        <WeatherDashboard />
      </TestWrapper>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Sol 4000 • 2024-01-01')).toBeInTheDocument();
    });

    // Should display wind data
    expect(screen.getByText('Wind')).toBeInTheDocument();
    expect(screen.getByText('12.5 m/s')).toBeInTheDocument();
    expect(screen.getByText('270°')).toBeInTheDocument();

    // Should also display temperature and pressure
    expect(screen.getByText('-45°C')).toBeInTheDocument();
    expect(screen.getByText('750 Pa')).toBeInTheDocument();
  });

  it('handles partial data quality indicators throughout the workflow', async () => {
    const partialQualityData = {
      ...mockWeatherData,
      latest: {
        ...mockWeatherData.latest,
        dataQuality: 'partial' as const,
        temperature: {
          ...mockWeatherData.latest.temperature,
          quality: 'partial' as const,
        },
        atmosphere: {
          ...mockWeatherData.latest.atmosphere,
          quality: 'partial' as const,
        },
      },
    };

    mockWeatherService.getWeatherData.mockResolvedValue({
      data: partialQualityData,
      meta: {
        totalSols: 1,
        requestTime: '2024-01-01T00:00:00Z',
        cached: false,
      },
    });

    render(
      <TestWrapper>
        <WeatherDashboard />
      </TestWrapper>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Sol 4000 • 2024-01-01')).toBeInTheDocument();
    });

    // Should show partial data quality indicators
    expect(screen.getByText(/partial data/i)).toBeInTheDocument();
    
    // Should still display the data
    expect(screen.getByText('-45°C')).toBeInTheDocument();
    expect(screen.getByText('750 Pa')).toBeInTheDocument();
  });

  it('handles Perseverance rover data workflow correctly', async () => {
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
          latitude: 18.4447,
          longitude: 77.4509,
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

    render(
      <TestWrapper>
        <WeatherDashboard />
      </TestWrapper>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Sol 4000 • 2024-01-01')).toBeInTheDocument();
    });

    // Should display Perseverance-specific information
    expect(screen.getByText('MEDA')).toBeInTheDocument();
    expect(screen.getByText('Jezero Crater')).toBeInTheDocument();
    expect(screen.getByText('Perseverance Rover')).toBeInTheDocument();

    // Should still display weather data
    expect(screen.getByText('-45°C')).toBeInTheDocument();
    expect(screen.getByText('750 Pa')).toBeInTheDocument();
  });

  it('maintains accessibility throughout the complete workflow', async () => {
    mockWeatherService.getWeatherData.mockResolvedValue({
      data: mockWeatherData,
      meta: {
        totalSols: 1,
        requestTime: '2024-01-01T00:00:00Z',
        cached: false,
      },
    });

    render(
      <TestWrapper>
        <WeatherDashboard />
      </TestWrapper>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Sol 4000 • 2024-01-01')).toBeInTheDocument();
    });

    // Should have proper heading structure
    const mainHeading = screen.getByRole('heading', { level: 2 });
    expect(mainHeading).toHaveTextContent('Mars Weather Data');

    // Should have proper labeling for interactive elements
    expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pressure/i)).toBeInTheDocument();

    // Should have proper semantic markup
    const weatherSection = screen.getByRole('region', { name: /weather/i });
    expect(weatherSection).toBeInTheDocument();
  });

  it('handles cached vs fresh data indicators in the workflow', async () => {
    // First load with fresh data
    mockWeatherService.getWeatherData.mockResolvedValueOnce({
      data: mockWeatherData,
      meta: {
        totalSols: 1,
        requestTime: '2024-01-01T00:00:00Z',
        cached: false,
      },
    });

    const { rerender } = render(
      <TestWrapper>
        <WeatherDashboard />
      </TestWrapper>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Sol 4000 • 2024-01-01')).toBeInTheDocument();
    });

    // Second load with cached data
    mockWeatherService.getWeatherData.mockResolvedValueOnce({
      data: mockWeatherData,
      meta: {
        totalSols: 1,
        requestTime: '2024-01-01T00:00:05Z',
        cached: true,
        cacheExpiry: '2024-01-01T00:05:00Z',
      },
    });

    // Force a re-render/refetch
    rerender(
      <TestWrapper>
        <WeatherDashboard />
      </TestWrapper>
    );

    // Should still display the same data
    await waitFor(() => {
      expect(screen.getByText('Sol 4000 • 2024-01-01')).toBeInTheDocument();
    });

    // Should indicate cached data if the component shows this information
    // (This depends on the actual implementation of cache indicators)
  });
});