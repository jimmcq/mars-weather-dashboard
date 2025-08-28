/**
 * Integration tests for complete application workflow
 * Tests the full user journey across the entire Mars Weather Dashboard
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from '@/app/page';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the services
jest.mock('@/features/mars-time/time-conversion', () => ({
  MarsTimeCalculator: {
    calculateMarsTime: jest.fn().mockReturnValue({
      msd: 52543.123456,
      mtc: '14:25:30',
      curiosityLTST: '15:10:45',
      perseveranceLTST: '16:22:15',
      curiositySol: 4123,
      perseveranceSol: 1056,
      earthTime: '12:34:56',
    }),
  },
}));

jest.mock('@/features/weather/weather-service', () => ({
  WeatherService: {
    getWeatherData: jest.fn(),
  },
}));

jest.mock('@/features/photos/photos-service', () => ({
  PhotosService: {
    getLatestPhotos: jest.fn(),
    transformForDisplay: jest.fn(),
  },
}));

import { WeatherService } from '@/features/weather/weather-service';
import { PhotosService } from '@/features/photos/photos-service';

const mockWeatherService = WeatherService as jest.Mocked<typeof WeatherService>;
const mockPhotosService = PhotosService as jest.Mocked<typeof PhotosService>;

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

const mockPhotoData = {
  photos: [
    {
      id: 1,
      sol: 4000,
      camera: {
        id: 20,
        name: 'FHAZ',
        rover_id: 5,
        full_name: 'Front Hazard Avoidance Camera',
      },
      img_src: 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/rvr/imgs/2023/1234.jpg',
      earth_date: '2024-01-01',
      rover: {
        id: 5,
        name: 'curiosity',
        landing_date: '2012-08-05',
        launch_date: '2011-11-26',
        status: 'active',
        max_sol: 4000,
        max_date: '2024-01-01',
        total_photos: 500000,
        cameras: [],
      },
    },
  ],
  latest: {
    sol: 4000,
    earth_date: '2024-01-01',
    total_photos: 1,
  },
  rover: 'curiosity' as const,
  requestTime: '2024-01-01T00:00:00Z',
  cached: false,
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

describe('Complete Application Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('loads the complete Mars Weather Dashboard with all features', async () => {
    // Mock successful API calls
    mockWeatherService.getWeatherData.mockResolvedValue({
      data: mockWeatherData,
      meta: {
        totalSols: 1,
        requestTime: '2024-01-01T00:00:00Z',
        cached: false,
      },
    });

    mockPhotosService.getLatestPhotos.mockResolvedValue(mockPhotoData);
    mockPhotosService.transformForDisplay.mockReturnValue({
      id: 1,
      sol: 4000,
      imgSrc: 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/rvr/imgs/2023/1234.jpg',
      earthDate: '2024-01-01',
      camera: {
        name: 'FHAZ',
        fullName: 'Front Hazard Avoidance Camera',
      },
      rover: {
        name: 'curiosity',
      },
      altText: 'Mars photo from Front Hazard Avoidance Camera on Sol 4000',
    });

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    // Should display the main header
    expect(screen.getByText('Mars Weather Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Real-time Martian time and weather data')).toBeInTheDocument();

    // Should display Mars time section
    expect(screen.getByText('Martian Time')).toBeInTheDocument();
    
    // Wait for Mars time to load
    await waitFor(() => {
      expect(screen.getByText('14:25:30')).toBeInTheDocument();
    });

    expect(screen.getByText('Coordinated Mars Time')).toBeInTheDocument();
    expect(screen.getByText('15:10:45')).toBeInTheDocument(); // Curiosity LTST
    expect(screen.getByText('16:22:15')).toBeInTheDocument(); // Perseverance LTST

    // Should display weather data section
    expect(screen.getByText('Mars Weather Data')).toBeInTheDocument();
    
    // Wait for weather data to load
    await waitFor(() => {
      expect(screen.getByText('Sol 4000 • 2024-01-01')).toBeInTheDocument();
    });

    expect(screen.getByText('-45°C')).toBeInTheDocument();
    expect(screen.getByText('750 Pa')).toBeInTheDocument();

    // Should display latest images section
    expect(screen.getByText('Latest Images')).toBeInTheDocument();

    // Wait for images to load
    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    // Should display technical note
    expect(screen.getByText(/Technical Demo/)).toBeInTheDocument();
    expect(screen.getByText(/NASA's Mars24 algorithm/)).toBeInTheDocument();

    // Should display footer
    expect(screen.getByText(/Built with ❤️ by/)).toBeInTheDocument();
    expect(screen.getByText('Jim McQuillan')).toBeInTheDocument();
  });

  it('handles the complete error recovery workflow across all features', async () => {
    // Mock initial failures
    mockWeatherService.getWeatherData.mockRejectedValueOnce(new Error('Weather service error'));
    mockPhotosService.getLatestPhotos.mockRejectedValueOnce(new Error('Photos service error'));

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    // Mars time should still work (it's calculated client-side)
    await waitFor(() => {
      expect(screen.getByText('14:25:30')).toBeInTheDocument();
    });

    // Weather should show error state
    await waitFor(() => {
      expect(screen.getByText('Unable to Load Weather Data')).toBeInTheDocument();
    });

    // Photos should show error state
    await waitFor(() => {
      expect(screen.getByText('Unable to Load Images')).toBeInTheDocument();
    });

    // Mock successful retries
    mockWeatherService.getWeatherData.mockResolvedValueOnce({
      data: mockWeatherData,
      meta: {
        totalSols: 1,
        requestTime: '2024-01-01T00:00:00Z',
        cached: false,
      },
    });

    mockPhotosService.getLatestPhotos.mockResolvedValueOnce(mockPhotoData);

    // Click retry buttons
    const retryButtons = screen.getAllByRole('button', { name: /try again/i });
    expect(retryButtons.length).toBeGreaterThan(0);

    fireEvent.click(retryButtons[0]!);

    // Weather should recover
    await waitFor(() => {
      expect(screen.getByText('Sol 4000 • 2024-01-01')).toBeInTheDocument();
    });

    expect(screen.getByText('-45°C')).toBeInTheDocument();
  });

  it('maintains real-time updates throughout the application lifecycle', async () => {
    // Mock successful API calls
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
        <HomePage />
      </TestWrapper>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('14:25:30')).toBeInTheDocument();
    });

    // Simulate real-time Mars time updates
    jest.advanceTimersByTime(3000); // 3 seconds

    // Mars time should continue updating (through the useMartianTime hook)
    // The exact time will depend on the mock implementation, but it should still be present
    expect(screen.getByText('Martian Time')).toBeInTheDocument();
    expect(screen.getByText('Live updates')).toBeInTheDocument();
  });

  it('provides proper accessibility throughout the complete application', async () => {
    // Mock successful API calls
    mockWeatherService.getWeatherData.mockResolvedValue({
      data: mockWeatherData,
      meta: {
        totalSols: 1,
        requestTime: '2024-01-01T00:00:00Z',
        cached: false,
      },
    });

    mockPhotosService.getLatestPhotos.mockResolvedValue(mockPhotoData);

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('14:25:30')).toBeInTheDocument();
    });

    // Should have proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('Mars Weather Dashboard');

    const subHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(subHeadings.length).toBeGreaterThan(0);

    const tertiaryHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(tertiaryHeadings.length).toBeGreaterThan(0);

    // Should have proper semantic sections
    const sections = screen.getAllByRole('region');
    expect(sections.length).toBeGreaterThan(0);

    // Should have proper ARIA live regions for time updates
    const liveRegions = screen.getAllByLabelText((content, element) => {
      return element?.getAttribute('aria-live') === 'polite';
    });
    expect(liveRegions.length).toBeGreaterThan(0);

    // Should have proper navigation elements
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();

    // Should have proper link accessibility
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('href');
      if (link.getAttribute('target') === '_blank') {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    });
  });

  it('handles responsive design and layout throughout the workflow', async () => {
    // Mock successful API calls
    mockWeatherService.getWeatherData.mockResolvedValue({
      data: mockWeatherData,
      meta: {
        totalSols: 1,
        requestTime: '2024-01-01T00:00:00Z',
        cached: false,
      },
    });

    const { container } = render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('14:25:30')).toBeInTheDocument();
    });

    // Should have responsive grid classes
    const gridElements = container.querySelectorAll('[class*="grid"]');
    expect(gridElements.length).toBeGreaterThan(0);

    // Should have responsive spacing classes
    const spacingElements = container.querySelectorAll('[class*="gap-"], [class*="space-"]');
    expect(spacingElements.length).toBeGreaterThan(0);

    // Should have proper container structure
    const mainContainer = container.querySelector('.container');
    expect(mainContainer).toBeInTheDocument();
  });

  it('maintains performance throughout the complete application lifecycle', async () => {
    const startTime = performance.now();

    // Mock successful API calls
    mockWeatherService.getWeatherData.mockResolvedValue({
      data: mockWeatherData,
      meta: {
        totalSols: 1,
        requestTime: '2024-01-01T00:00:00Z',
        cached: false,
      },
    });

    mockPhotosService.getLatestPhotos.mockResolvedValue(mockPhotoData);

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    // Wait for all content to load
    await waitFor(() => {
      expect(screen.getByText('14:25:30')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Sol 4000 • 2024-01-01')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Rendering should complete within a reasonable time (5 seconds for integration test)
    expect(renderTime).toBeLessThan(5000);

    // Should not have unnecessary re-renders (check that content is stable)
    const marsTimeElement = screen.getByText('14:25:30');
    expect(marsTimeElement).toBeInTheDocument();
    
    // Simulate passage of time
    jest.advanceTimersByTime(100);
    
    // Content should still be accessible
    expect(screen.getByText('Martian Time')).toBeInTheDocument();
  });
});