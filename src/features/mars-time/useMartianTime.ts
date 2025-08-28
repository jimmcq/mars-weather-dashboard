/**
 * Real-time Mars time hook
 * Updates Mars time calculations every second
 */

'use client';

import { useState, useEffect } from 'react';
import { MarsTimeCalculator } from './time-conversion';
import { MarsTimeData, MarsTimeOptions } from '@/types/mars-time';

/**
 * Custom hook for real-time Mars time calculations
 *
 * Provides:
 * - Coordinated Mars Time (MTC)
 * - Local True Solar Time for both rovers
 * - Mission sol numbers
 * - Real-time updates with configurable intervals
 *
 * @param {MarsTimeOptions} options - Configuration options for the hook
 * @param {number} options.updateInterval - Update frequency in milliseconds (default: 1000)
 * @param {boolean} options.includePrecision - Include high-precision calculations (default: false)
 * @returns {MarsTimeData | null} Current Mars time data or null during initialization
 */
export function useMartianTime(
  options: MarsTimeOptions = {}
): MarsTimeData | null {
  const { updateInterval = 1000, includePrecision = false } = options;
  const [marsTime, setMarsTime] = useState<MarsTimeData | null>(null);

  useEffect(() => {
    const updateMarsTime = (): void => {
      const now = new Date();
      const timeData = MarsTimeCalculator.calculateMarsTime(now);
      setMarsTime(timeData);
    };

    // Initial calculation
    updateMarsTime();

    // Set up interval for real-time updates
    const interval = setInterval(updateMarsTime, updateInterval);

    // Cleanup on unmount
    return (): void => clearInterval(interval);
  }, [updateInterval, includePrecision]);

  return marsTime;
}
