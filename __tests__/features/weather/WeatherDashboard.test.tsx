/**
 * Tests for WeatherDashboard component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeatherDashboard } from '@/features/weather/WeatherDashboard';

// Mock the useWeatherData hook
jest.mock('@/features/weather/useWeatherData', () => ({
  useWeatherData: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.ComponentProps<'div'>): React.ReactElement => (
      <div {...props}>{children}</div>
    ),
  },
}));

// Mock TermTooltip to render children without tooltip functionality
jest.mock('@/components/TermTooltip', () => ({
  TermTooltip: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => <>{children}</>,
}));

import { useWeatherData } from '@/features/weather/useWeatherData';

const mockUseWeatherData = useWeatherData as jest.MockedFunction<
  typeof useWeatherData
>;

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

describe('WeatherDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockUseWeatherData.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
      lastFetch: null,
    });

    render(<WeatherDashboard />);

    expect(screen.getByText('Mars Weather')).toBeInTheDocument();
    // Check for loading skeletons
    expect(screen.getAllByRole('generic')).toContainEqual(
      expect.objectContaining({
        className: expect.stringContaining('animate-pulse'),
      })
    );
  });

  it('renders weather data when loaded', () => {
    mockUseWeatherData.mockReturnValue({
      data: mockWeatherData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      lastFetch: '2024-01-01T00:00:00Z',
    });

    render(<WeatherDashboard />);

    // Check header
    expect(screen.getByText('Mars Weather')).toBeInTheDocument();
    expect(screen.getByText('Sol 4000')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();

    // Check temperature data
    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('-45.0°C')).toBeInTheDocument();
    expect(screen.getByText('High: -10.0°')).toBeInTheDocument();
    expect(screen.getByText('Low: -80.0°')).toBeInTheDocument();

    // Check pressure data
    expect(screen.getByText('Pressure')).toBeInTheDocument();
    expect(screen.getByText('7.5 hPa')).toBeInTheDocument();

    // Check location info
    expect(screen.getByText('Gale Crater')).toBeInTheDocument();
    expect(screen.getByText('REMS instrument')).toBeInTheDocument();
  });

  it('renders error state when data fetch fails', () => {
    const mockRefetch = jest.fn();
    mockUseWeatherData.mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Failed to fetch weather data',
      refetch: mockRefetch,
      lastFetch: null,
    });

    render(<WeatherDashboard />);

    expect(screen.getByText('Weather Data Unavailable')).toBeInTheDocument();
    expect(
      screen.getByText(/Unable to fetch weather data/)
    ).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('allows rover switching', async () => {
    const mockRefetch = jest.fn();
    mockUseWeatherData.mockReturnValue({
      data: mockWeatherData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      lastFetch: '2024-01-01T00:00:00Z',
    });

    render(<WeatherDashboard />);

    // Find rover selector buttons
    const curiosityButton = screen.getByRole('button', { name: /curiosity/i });
    const perseveranceButton = screen.getByRole('button', {
      name: /perseverance/i,
    });
    expect(curiosityButton).toBeInTheDocument();
    expect(perseveranceButton).toBeInTheDocument();

    // Click perseverance button to switch rovers
    fireEvent.click(perseveranceButton);

    // The component updates the selectedRover state internally
    expect(perseveranceButton).toHaveClass('bg-blue-600');
  });

  it('displays wind data when available', () => {
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

    mockUseWeatherData.mockReturnValue({
      data: weatherDataWithWind,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      lastFetch: '2024-01-01T00:00:00Z',
    });

    render(<WeatherDashboard />);

    expect(screen.getByText('Wind')).toBeInTheDocument();
    expect(screen.getByText('12.5 m/s')).toBeInTheDocument();
    expect(screen.getByText('270°')).toBeInTheDocument();
  });

  it('handles partial data quality indicators', () => {
    const partialQualityData = {
      ...mockWeatherData,
      latest: {
        ...mockWeatherData.latest,
        dataQuality: 'partial' as const,
        temperature: {
          ...mockWeatherData.latest.temperature,
          quality: 'partial' as const,
        },
      },
    };

    mockUseWeatherData.mockReturnValue({
      data: partialQualityData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      lastFetch: '2024-01-01T00:00:00Z',
    });

    render(<WeatherDashboard />);

    // Should show quality indicators
    expect(screen.getByText('Data quality: partial')).toBeInTheDocument();
  });

  it('displays correct instrument information', () => {
    mockUseWeatherData.mockReturnValue({
      data: mockWeatherData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      lastFetch: '2024-01-01T00:00:00Z',
    });

    render(<WeatherDashboard />);

    expect(screen.getByText('REMS instrument')).toBeInTheDocument();
  });

  it('shows last updated timestamp', () => {
    mockUseWeatherData.mockReturnValue({
      data: mockWeatherData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      lastFetch: '2024-01-01T00:00:00Z',
    });

    render(<WeatherDashboard />);

    // Check for last updated information
    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
  });

  it('handles Perseverance rover data correctly', () => {
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

    mockUseWeatherData.mockReturnValue({
      data: perseveranceData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      lastFetch: '2024-01-01T00:00:00Z',
    });

    render(<WeatherDashboard />);

    expect(screen.getByText('MEDA instrument')).toBeInTheDocument();
    expect(screen.getByText('Jezero Crater')).toBeInTheDocument();
  });

  it('renders with proper accessibility attributes', () => {
    mockUseWeatherData.mockReturnValue({
      data: mockWeatherData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      lastFetch: '2024-01-01T00:00:00Z',
    });

    render(<WeatherDashboard />);

    // Check for proper headings (component uses h3, not h2)
    const mainHeading = screen.getByRole('heading', { level: 3 });
    expect(mainHeading).toHaveTextContent('Mars Weather');

    // Check for temperature and pressure text content (no aria-label used)
    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('Pressure')).toBeInTheDocument();
  });
});
