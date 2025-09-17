/**
 * Tests for MartianClock component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MartianClock } from '@/features/mars-time/MartianClock';

// Mock the useMartianTime hook
jest.mock('@/features/mars-time/useMartianTime', () => ({
  useMartianTime: jest.fn(),
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

import { useMartianTime } from '@/features/mars-time/useMartianTime';

const mockUseMartianTime = useMartianTime as jest.MockedFunction<
  typeof useMartianTime
>;

const mockMarsTimeData = {
  msd: 52543.123456,
  mtc: '14:25:30',
  curiosityLTST: '15:10:45',
  perseveranceLTST: '16:22:15',
  curiositySol: 4123,
  perseveranceSol: 1056,
  earthTime: '12:34:56',
};

describe('MartianClock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when Mars time is not available', () => {
    mockUseMartianTime.mockReturnValue(null);

    render(<MartianClock />);

    expect(screen.getByText('Martian Time')).toBeInTheDocument();
    // Check for loading skeleton elements
    const loadingSkeleton = screen
      .getByText('Martian Time')
      .closest('div')
      ?.querySelector('.animate-pulse');
    expect(loadingSkeleton).toBeTruthy();
  });

  it('renders Mars time data when available', () => {
    mockUseMartianTime.mockReturnValue(mockMarsTimeData);

    render(<MartianClock />);

    // Check main title
    expect(screen.getByText('Martian Time')).toBeInTheDocument();

    // Check Coordinated Mars Time
    expect(screen.getByText('Coordinated Mars Time')).toBeInTheDocument();
    expect(screen.getByText('14:25:30')).toBeInTheDocument();
    expect(screen.getByText('Mars Sol Date: 52543.12')).toBeInTheDocument();

    // Check Curiosity data
    expect(screen.getByText('Curiosity (Gale Crater)')).toBeInTheDocument();
    expect(screen.getByText('15:10:45')).toBeInTheDocument();
    expect(screen.getByText('Sol 4,123')).toBeInTheDocument();

    // Check Perseverance data
    expect(
      screen.getByText('Perseverance (Jezero Crater)')
    ).toBeInTheDocument();
    expect(screen.getByText('16:22:15')).toBeInTheDocument();
    expect(screen.getByText('Sol 1,056')).toBeInTheDocument();

    // Check Earth time reference
    expect(screen.getByText('Earth UTC Reference')).toBeInTheDocument();
    expect(screen.getByText('12:34:56')).toBeInTheDocument();

    // Check live indicator
    expect(screen.getByText('Live updates')).toBeInTheDocument();
  });

  it('displays correct accessibility attributes', () => {
    mockUseMartianTime.mockReturnValue(mockMarsTimeData);

    render(<MartianClock />);

    // Check for aria-live regions for real-time updates
    const liveRegions = screen
      .getAllByRole('generic', { hidden: true })
      .filter((el) => el.getAttribute('aria-live') === 'polite');

    expect(liveRegions.length).toBeGreaterThan(0);
  });

  it('formats sol numbers with proper localization', () => {
    const dataWithLargeSols = {
      ...mockMarsTimeData,
      curiositySol: 12345,
      perseveranceSol: 6789,
    };

    mockUseMartianTime.mockReturnValue(dataWithLargeSols);

    render(<MartianClock />);

    // Check that large numbers are formatted with commas
    expect(screen.getByText('Sol 12,345')).toBeInTheDocument();
    expect(screen.getByText('Sol 6,789')).toBeInTheDocument();
  });

  it('handles edge case with zero sol numbers', () => {
    const dataWithZeroSols = {
      ...mockMarsTimeData,
      curiositySol: 0,
      perseveranceSol: 0,
    };

    mockUseMartianTime.mockReturnValue(dataWithZeroSols);

    render(<MartianClock />);

    // Check that sol numbers are displayed - they appear as "Sol 0"
    const solElements = screen.getAllByText((content) => {
      return content.includes('Sol') && content.includes('0');
    });
    expect(solElements.length).toBeGreaterThan(0);
  });

  it('displays Mars Sol Date with correct precision', () => {
    const dataWithPreciseMSD = {
      ...mockMarsTimeData,
      msd: 52543.987654321,
    };

    mockUseMartianTime.mockReturnValue(dataWithPreciseMSD);

    render(<MartianClock />);

    // Should round to 2 decimal places
    expect(screen.getByText('Mars Sol Date: 52543.99')).toBeInTheDocument();
  });

  it('renders with consistent layout structure', () => {
    mockUseMartianTime.mockReturnValue(mockMarsTimeData);

    const { container } = render(<MartianClock />);

    // Check main container structure
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass(
      'rounded-lg',
      'border',
      'border-slate-700'
    );

    // Check for proper spacing structure
    expect(container.querySelector('.space-y-6')).toBeInTheDocument();
  });

  it('maintains accessibility with proper heading hierarchy', () => {
    mockUseMartianTime.mockReturnValue(mockMarsTimeData);

    render(<MartianClock />);

    const mainHeading = screen.getByRole('heading', { level: 3 });
    expect(mainHeading).toHaveTextContent('Martian Time');
  });

  it('shows live updates indicator', () => {
    mockUseMartianTime.mockReturnValue(mockMarsTimeData);

    render(<MartianClock />);

    const liveIndicator = screen.getByText('Live updates');
    expect(liveIndicator).toBeInTheDocument();

    // Check for animated pulse indicator
    const pulseElements = screen
      .getByText('Live updates')
      .closest('div')
      ?.querySelectorAll('.animate-pulse');
    expect(pulseElements?.length).toBeGreaterThan(0);
  });
});
