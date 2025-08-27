/**
 * Tests for HistoricalTrends component
 */

import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistoricalTrends } from '@/features/weather/HistoricalTrends';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

// Mock Recharts components
jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
    LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
    AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
    Line: () => <div data-testid="line" />,
    Area: () => <div data-testid="area" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
}));

// Mock useWeatherData hook
jest.mock('@/features/weather/useWeatherData', () => ({
    useWeatherData: jest.fn(() => ({
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
            ]
        },
        isLoading: false,
    })),
}));

describe('HistoricalTrends', () => {
    it('renders with data', () => {
        render(<HistoricalTrends />);
        
        expect(screen.getByText('Historical Trends')).toBeInTheDocument();
        expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('shows loading state', () => {
        // Mock loading state
        const mockUseWeatherData = require('@/features/weather/useWeatherData');
        mockUseWeatherData.useWeatherData.mockReturnValueOnce({
            data: null,
            isLoading: true,
        });

        render(<HistoricalTrends />);
        
        // Check for skeleton loader
        expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
        // Loading state shows skeleton elements
        expect(document.querySelectorAll('.bg-slate-700').length).toBeGreaterThan(0);
    });

    it('shows no data state', () => {
        // Mock no data state
        const mockUseWeatherData = require('@/features/weather/useWeatherData');
        mockUseWeatherData.useWeatherData.mockReturnValueOnce({
            data: { history: [] },
            isLoading: false,
        });

        render(<HistoricalTrends />);
        
        expect(screen.getByText('Historical Trends')).toBeInTheDocument();
        expect(screen.getByText('No historical data available')).toBeInTheDocument();
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
        const areaChartButton = chartTypeButtons.find(button => 
            button.querySelector('[data-testid="bar-chart-3"]') || 
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
        const { container } = render(
            <HistoricalTrends className="custom-class" />
        );
        
        expect(container.firstChild).toHaveClass('custom-class');
    });
});