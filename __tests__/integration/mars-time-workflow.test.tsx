/**
 * Integration tests for Mars time workflow
 * Tests the complete user journey from page load to real-time updates
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MartianClock } from '@/features/mars-time/MartianClock';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock the time calculations to return predictable data
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

import { MarsTimeCalculator } from '@/features/mars-time/time-conversion';

const mockMarsTimeCalculator = MarsTimeCalculator as jest.Mocked<typeof MarsTimeCalculator>;

describe('Mars Time Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('displays Mars time data and updates in real-time', async () => {
    // Render the MartianClock component
    render(<MartianClock />);

    // Should show the main title
    expect(screen.getByText('Martian Time')).toBeInTheDocument();

    // Should show Mars time data after initial calculation
    await waitFor(() => {
      expect(screen.getByText('14:25:30')).toBeInTheDocument();
    });

    // Verify all time components are displayed
    expect(screen.getByText('Coordinated Mars Time')).toBeInTheDocument();
    expect(screen.getByText('15:10:45')).toBeInTheDocument(); // Curiosity LTST
    expect(screen.getByText('16:22:15')).toBeInTheDocument(); // Perseverance LTST
    expect(screen.getByText('Sol 4,123')).toBeInTheDocument(); // Curiosity Sol
    expect(screen.getByText('Sol 1,056')).toBeInTheDocument(); // Perseverance Sol

    // Should show rover location information
    expect(screen.getByText('Curiosity (Gale Crater)')).toBeInTheDocument();
    expect(screen.getByText('Perseverance (Jezero Crater)')).toBeInTheDocument();

    // Should show Earth UTC reference
    expect(screen.getByText('Earth UTC Reference')).toBeInTheDocument();
    expect(screen.getByText('12:34:56')).toBeInTheDocument();

    // Should show live updates indicator
    expect(screen.getByText('Live updates')).toBeInTheDocument();

    // Initial calculation should have been called
    expect(mockMarsTimeCalculator.calculateMarsTime).toHaveBeenCalledTimes(1);

    // Simulate real-time updates (advance 1 second)
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should trigger another calculation
    expect(mockMarsTimeCalculator.calculateMarsTime).toHaveBeenCalledTimes(2);

    // Simulate multiple updates
    act(() => {
      jest.advanceTimersByTime(5000); // Advance 5 more seconds
    });

    // Should have called calculateMarsTime 7 times total (initial + 6 updates)
    expect(mockMarsTimeCalculator.calculateMarsTime).toHaveBeenCalledTimes(7);
  });

  it('handles time calculation updates with changing data', async () => {
    // Mock changing time data
    const timeSequence = [
      {
        msd: 52543.123456,
        mtc: '14:25:30',
        curiosityLTST: '15:10:45',
        perseveranceLTST: '16:22:15',
        curiositySol: 4123,
        perseveranceSol: 1056,
        earthTime: '12:34:56',
      },
      {
        msd: 52543.123457,
        mtc: '14:25:31',
        curiosityLTST: '15:10:46',
        perseveranceLTST: '16:22:16',
        curiositySol: 4123,
        perseveranceSol: 1056,
        earthTime: '12:34:57',
      },
      {
        msd: 52543.123458,
        mtc: '14:25:32',
        curiosityLTST: '15:10:47',
        perseveranceLTST: '16:22:17',
        curiositySol: 4123,
        perseveranceSol: 1056,
        earthTime: '12:34:58',
      },
    ];

    mockMarsTimeCalculator.calculateMarsTime
      .mockReturnValueOnce(timeSequence[0]!)
      .mockReturnValueOnce(timeSequence[1]!)
      .mockReturnValueOnce(timeSequence[2]!);

    render(<MartianClock />);

    // Initial state
    await waitFor(() => {
      expect(screen.getByText('14:25:30')).toBeInTheDocument();
    });
    expect(screen.getByText('15:10:45')).toBeInTheDocument();

    // First update
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('14:25:31')).toBeInTheDocument();
    });
    expect(screen.getByText('15:10:46')).toBeInTheDocument();

    // Second update
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('14:25:32')).toBeInTheDocument();
    });
    expect(screen.getByText('15:10:47')).toBeInTheDocument();
  });

  it('provides accessible time updates for screen readers', async () => {
    render(<MartianClock />);

    // Find aria-live regions that announce changes
    const liveRegions = screen.getAllByLabelText((content, element) => {
      return element?.getAttribute('aria-live') === 'polite';
    });

    expect(liveRegions.length).toBeGreaterThan(0);

    // Verify the content is announced
    await waitFor(() => {
      expect(screen.getByText('14:25:30')).toBeInTheDocument();
    });

    // Check that time data is within live regions for screen reader updates
    const mtcTime = screen.getByText('14:25:30');
    const curiosityTime = screen.getByText('15:10:45');
    const perseveranceTime = screen.getByText('16:22:15');

    // These elements should be within containers that have aria-live
    expect(mtcTime.closest('[aria-live="polite"]')).toBeTruthy();
    expect(curiosityTime.closest('[aria-live="polite"]')).toBeTruthy();
    expect(perseveranceTime.closest('[aria-live="polite"]')).toBeTruthy();
  });

  it('maintains consistent layout structure throughout updates', async () => {
    const { container } = render(<MartianClock />);

    // Initial layout
    await waitFor(() => {
      expect(screen.getByText('14:25:30')).toBeInTheDocument();
    });

    const initialStructure = container.innerHTML;

    // Update time
    mockMarsTimeCalculator.calculateMarsTime.mockReturnValue({
      msd: 52543.123457,
      mtc: '14:25:31',
      curiosityLTST: '15:10:46',
      perseveranceLTST: '16:22:16',
      curiositySol: 4123,
      perseveranceSol: 1056,
      earthTime: '12:34:57',
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('14:25:31')).toBeInTheDocument();
    });

    const updatedStructure = container.innerHTML;

    // Structure should remain the same, only time values should change
    // Remove time values and compare structure
    const normalizeStructure = (html: string) =>
      html
        .replace(/\d{2}:\d{2}:\d{2}/g, 'TIME')
        .replace(/Sol \d{1,3},\d{3}/g, 'SOL')
        .replace(/\d{5}\.\d{2}/g, 'MSD');

    expect(normalizeStructure(updatedStructure)).toBe(normalizeStructure(initialStructure));
  });

  it('gracefully handles calculation errors without breaking the UI', async () => {
    // Mock console.error to suppress error logs in test output
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // First call succeeds, second call fails
    mockMarsTimeCalculator.calculateMarsTime
      .mockReturnValueOnce({
        msd: 52543.123456,
        mtc: '14:25:30',
        curiosityLTST: '15:10:45',
        perseveranceLTST: '16:22:15',
        curiositySol: 4123,
        perseveranceSol: 1056,
        earthTime: '12:34:56',
      })
      .mockImplementationOnce(() => {
        throw new Error('Calculation failed');
      });

    render(<MartianClock />);

    // Initial render should work
    await waitFor(() => {
      expect(screen.getByText('14:25:30')).toBeInTheDocument();
    });

    // Trigger update that will fail
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Component should still show the last known good data
    expect(screen.getByText('14:25:30')).toBeInTheDocument();
    expect(screen.getByText('Martian Time')).toBeInTheDocument();

    // Error should have been logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error calculating Mars time:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});