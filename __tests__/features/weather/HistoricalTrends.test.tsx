/**
 * Tests for HistoricalTrends component
 */

import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistoricalTrends } from '@/features/weather/HistoricalTrends';
import { useWeatherData } from '@/features/weather/useWeatherData';

// Mock framer-motion to avoid animation issues in tests
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

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => <div data-testid="chart-container">{children}</div>,
  LineChart: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => <div data-testid="line-chart">{children}</div>,
  AreaChart: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => <div data-testid="area-chart">{children}</div>,
  Line: (): React.ReactElement => <div data-testid="line" />,
  Area: (): React.ReactElement => <div data-testid="area" />,
  XAxis: (): React.ReactElement => <div data-testid="x-axis" />,
  YAxis: (): React.ReactElement => <div data-testid="y-axis" />,
  CartesianGrid: (): React.ReactElement => <div data-testid="grid" />,
  Tooltip: (): React.ReactElement => <div data-testid="tooltip" />,
  Legend: (): React.ReactElement => <div data-testid="legend" />,
}));

// Mock useWeatherData hook
jest.mock('@/features/weather/useWeatherData');

// Default mock data
const defaultMockData = {
  data: {
    history: [
      {
        sol: 3800,
        earthDate: '2023-01-01',
        temperature: {
          min: -80.5,
          max: -10.2,
          average: -45.3,
          unit: 'celsius',
          quality: 'complete',
        },
        atmosphere: {
          pressure: 75000,
          unit: 'pa',
          quality: 'complete',
        },
        wind: {
          speed: 12.5,
          direction: 180,
          unit: 'mps',
          quality: 'complete',
        },
        rover: 'curiosity',
        instrument: 'REMS',
        dataQuality: 'complete',
        location: {
          latitude: -4.5,
          longitude: 137.4,
          landingDate: '2012-08-06',
          locationName: 'Gale Crater',
        },
        lastUpdated: '2023-01-01T12:00:00Z',
      },
      {
        sol: 3801,
        earthDate: '2023-01-02',
        temperature: {
          min: -82.1,
          max: -8.7,
          average: -43.9,
          unit: 'celsius',
          quality: 'complete',
        },
        atmosphere: {
          pressure: 76000,
          unit: 'pa',
          quality: 'complete',
        },
        wind: {
          speed: 15.2,
          direction: 200,
          unit: 'mps',
          quality: 'complete',
        },
        rover: 'curiosity',
        instrument: 'REMS',
        dataQuality: 'complete',
        location: {
          latitude: -4.5,
          longitude: 137.4,
          landingDate: '2012-08-06',
          locationName: 'Gale Crater',
        },
        lastUpdated: '2023-01-02T12:00:00Z',
      },
    ],
  },
  isLoading: false,
  error: null,
  refetch: jest.fn(),
  lastFetch: null,
};

// Cast the mock
const mockedUseWeatherData = jest.mocked(useWeatherData);

describe('HistoricalTrends', () => {
  beforeEach(() => {
    // Reset mock to default state before each test
    mockedUseWeatherData.mockReturnValue(defaultMockData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders with data', () => {
    render(<HistoricalTrends />);

    expect(screen.getByText('Historical Trends')).toBeInTheDocument();
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    // Mock loading state for this specific test
    mockedUseWeatherData.mockReturnValueOnce({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
      lastFetch: null,
    });

    render(<HistoricalTrends />);

    // Check for skeleton loader
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    // Loading state shows skeleton elements
    expect(document.querySelectorAll('.bg-slate-700').length).toBeGreaterThan(
      0
    );
  });

  it('shows no data state', () => {
    // Mock no data state for this specific test
    mockedUseWeatherData.mockReturnValueOnce({
      data: { history: [] },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      lastFetch: null,
    });

    render(<HistoricalTrends />);

    expect(screen.getByText('Historical Trends')).toBeInTheDocument();
    expect(
      screen.getByText('No historical data available')
    ).toBeInTheDocument();
  });

  it('allows switching between rovers', () => {
    render(<HistoricalTrends />);

    // Check rover selector buttons exist
    expect(screen.getByText('Curiosity')).toBeInTheDocument();
    expect(screen.getByText('Perseverance')).toBeInTheDocument();

    // Switch to Perseverance
    fireEvent.click(screen.getByText('Perseverance'));

    // Should still render the chart
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('allows switching between metrics', () => {
    render(<HistoricalTrends />);

    // Default should be temperature
    expect(screen.getByText('temperature')).toBeInTheDocument();
    expect(screen.getByText('pressure')).toBeInTheDocument();
    expect(screen.getByText('wind')).toBeInTheDocument();

    // Switch to pressure
    fireEvent.click(screen.getByText('pressure'));

    // Should still render the chart
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('allows switching between chart types', () => {
    render(<HistoricalTrends />);

    // Default should be line chart
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();

    // Click on area chart button (second button in chart type selector)
    const chartTypeButtons = screen.getAllByRole('button');
    const areaChartButton = chartTypeButtons.find(
      (button) =>
        button.querySelector('[data-testid="bar-chart-3"]') !== null ||
        button.className.includes('bg-slate-600')
    );

    if (areaChartButton) {
      fireEvent.click(areaChartButton);
    }

    // Should still have chart container
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('allows switching time ranges', () => {
    render(<HistoricalTrends />);

    // Find time range buttons (no more 'all' option)
    expect(screen.getByText('7d')).toBeInTheDocument();
    expect(screen.getByText('14d')).toBeInTheDocument();
    expect(screen.getByText('30d')).toBeInTheDocument();
    expect(screen.queryByText('all')).not.toBeInTheDocument();

    // Switch to 14d
    fireEvent.click(screen.getByText('14d'));

    // Should still render the chart
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('displays data info correctly', () => {
    render(<HistoricalTrends />);

    // Should show the number of sols
    expect(screen.getByText('Showing 2 sols of data')).toBeInTheDocument();

    // Should show date range
    expect(screen.getByText('2023-01-01 - 2023-01-02')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<HistoricalTrends className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
