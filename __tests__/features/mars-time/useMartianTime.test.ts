/**
 * Tests for useMartianTime hook
 */

import { renderHook, act } from '@testing-library/react';
import { useMartianTime } from '@/features/mars-time/useMartianTime';

// Mock the MarsTimeCalculator
jest.mock('@/features/mars-time/time-conversion', () => ({
  MarsTimeCalculator: {
    calculateMarsTime: jest.fn(),
  },
}));

import { MarsTimeCalculator } from '@/features/mars-time/time-conversion';

const mockMarsTimeCalculator = MarsTimeCalculator as jest.Mocked<typeof MarsTimeCalculator>;

const mockMarsTimeData = {
  msd: 52543.123456,
  mtc: '14:25:30',
  curiosityLTST: '15:10:45',
  perseveranceLTST: '16:22:15',
  curiositySol: 4123,
  perseveranceSol: 1056,
  earthTime: '12:34:56',
};

describe('useMartianTime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockMarsTimeCalculator.calculateMarsTime.mockReturnValue(mockMarsTimeData);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns Mars time data immediately after mount', () => {
    const { result } = renderHook(() => useMartianTime());

    expect(result.current).toEqual(mockMarsTimeData);
    expect(mockMarsTimeCalculator.calculateMarsTime).toHaveBeenCalledWith(expect.any(Date));
  });

  it('calculates Mars time after mount', () => {
    const { result } = renderHook(() => useMartianTime());

    // Fast-forward to trigger initial calculation
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toEqual(mockMarsTimeData);
    expect(mockMarsTimeCalculator.calculateMarsTime).toHaveBeenCalledWith(expect.any(Date));
  });

  it('updates Mars time every second', () => {
    const { result } = renderHook(() => useMartianTime());

    // Initial calculation
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockMarsTimeCalculator.calculateMarsTime).toHaveBeenCalledTimes(1);

    // Advance by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockMarsTimeCalculator.calculateMarsTime).toHaveBeenCalledTimes(2);

    // Advance by another second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockMarsTimeCalculator.calculateMarsTime).toHaveBeenCalledTimes(3);
  });

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    const { unmount } = renderHook(() => useMartianTime());

    act(() => {
      jest.advanceTimersByTime(100);
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('handles calculation errors gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockMarsTimeCalculator.calculateMarsTime.mockImplementation(() => {
      throw new Error('Calculation error');
    });

    const { result } = renderHook(() => useMartianTime());

    expect(result.current).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error calculating Mars time:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('continues working after recovering from error', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // First call throws error
    mockMarsTimeCalculator.calculateMarsTime
      .mockImplementationOnce(() => {
        throw new Error('Calculation error');
      })
      .mockReturnValueOnce(mockMarsTimeData);

    const { result } = renderHook(() => useMartianTime());

    // First calculation fails
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();

    // Second calculation succeeds
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current).toEqual(mockMarsTimeData);

    consoleErrorSpy.mockRestore();
  });

  it('calculates with current time on each update', () => {
    const startTime = new Date('2024-01-01T12:00:00Z');
    jest.setSystemTime(startTime);

    const { result } = renderHook(() => useMartianTime());

    // Initial call should be with start time
    expect(mockMarsTimeCalculator.calculateMarsTime).toHaveBeenCalledWith(startTime);

    // Advance system time and timer
    const nextTime = new Date('2024-01-01T12:00:01Z');
    jest.setSystemTime(nextTime);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockMarsTimeCalculator.calculateMarsTime).toHaveBeenLastCalledWith(nextTime);
  });

  it('provides consistent updates over multiple seconds', () => {
    // Mock different return values for each call
    const timeSequence = [
      { ...mockMarsTimeData, mtc: '14:25:30', earthTime: '12:34:56' },
      { ...mockMarsTimeData, mtc: '14:25:31', earthTime: '12:34:57' },
      { ...mockMarsTimeData, mtc: '14:25:32', earthTime: '12:34:58' },
    ];

    mockMarsTimeCalculator.calculateMarsTime
      .mockReturnValueOnce(timeSequence[0]!)
      .mockReturnValueOnce(timeSequence[1]!)
      .mockReturnValueOnce(timeSequence[2]!);

    const { result } = renderHook(() => useMartianTime());

    // Initial calculation (happens immediately)
    expect(result.current?.mtc).toBe('14:25:30');

    // First update
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current?.mtc).toBe('14:25:31');

    // Second update
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current?.mtc).toBe('14:25:32');

    expect(mockMarsTimeCalculator.calculateMarsTime).toHaveBeenCalledTimes(3);
  });

  it('maintains state stability between renders', () => {
    const { result, rerender } = renderHook(() => useMartianTime());

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const firstResult = result.current;

    // Rerender the hook
    rerender();

    // State should be the same
    expect(result.current).toBe(firstResult);
  });
});