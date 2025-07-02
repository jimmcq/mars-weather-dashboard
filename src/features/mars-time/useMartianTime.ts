/**
 * Real-time Mars time hook
 * Updates Mars time calculations every second
 */

'use client';

import { useState, useEffect } from 'react';
import { MarsTimeCalculator } from './time-conversion';
import { MarsTimeData, MarsTimeOptions } from '@/types/mars-time';

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
