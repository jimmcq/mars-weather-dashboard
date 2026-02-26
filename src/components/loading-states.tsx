/**
 * Loading State Components
 * Provides various loading indicators and skeleton screens
 */

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Satellite, Clock } from 'lucide-react';
import React from 'react';

/**
 * Generic loading spinner component
 * @param props - Loading spinner props
 * @returns Loading spinner JSX
 */
export function LoadingSpinner({
  size = 'md',
  text,
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}): React.ReactElement {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <Loader2
          className={`animate-spin text-red-400 ${sizeClasses[size]}`}
          aria-hidden="true"
        />
        {text && (
          <p className="text-sm text-slate-400" aria-live="polite">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Mars-themed loading animation
 * @param props - Mars loading props
 * @returns Mars loading animation JSX
 */
export function MarsLoadingAnimation({
  text = 'Contacting Mars...',
}: {
  text?: string;
}): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="mb-4"
      >
        <Satellite className="h-12 w-12 text-red-400" aria-hidden="true" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-slate-400"
        aria-live="polite"
      >
        {text}
      </motion.p>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="mt-3 h-1 max-w-xs rounded-full bg-gradient-to-r from-red-600 to-orange-500"
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Weather card skeleton loader
 * @returns Weather card skeleton JSX
 */
export function WeatherCardSkeleton(): React.ReactElement {
  return (
    <div className="animate-pulse rounded-lg border border-slate-700 bg-slate-800/50 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-32 rounded bg-slate-700"></div>
        <div className="h-5 w-5 rounded bg-slate-700"></div>
      </div>

      {/* Main content */}
      <div className="mb-6">
        <div className="mb-2 h-8 w-20 rounded bg-slate-700"></div>
        <div className="h-4 w-16 rounded bg-slate-700"></div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-16 rounded bg-slate-700"></div>
            <div className="h-5 w-12 rounded bg-slate-700"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Chart skeleton loader
 * @returns Chart skeleton JSX
 */
const CHART_BAR_HEIGHTS = [65, 42, 78, 55, 90, 38, 72];

export function ChartSkeleton(): React.ReactElement {
  const barHeights = useMemo(() => CHART_BAR_HEIGHTS, []);

  return (
    <div className="animate-pulse rounded-lg border border-slate-700 bg-slate-800/50 p-6">
      {/* Chart header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-6 w-40 rounded bg-slate-700"></div>
        <div className="h-4 w-20 rounded bg-slate-700"></div>
      </div>

      {/* Chart area */}
      <div className="relative h-64 rounded bg-slate-700/30">
        {/* Simulated chart lines */}
        <div className="absolute top-8 right-8 bottom-8 left-8">
          <div className="flex h-full items-end justify-between">
            {barHeights.map((height, i) => (
              <div
                key={i}
                className="w-2 bg-slate-600"
                style={{ height: `${height}%` }}
              ></div>
            ))}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="absolute right-8 bottom-2 left-8 flex justify-between">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-3 w-8 rounded bg-slate-700"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Mars time clock skeleton
 * @returns Clock skeleton JSX
 */
export function MarsClockSkeleton(): React.ReactElement {
  return (
    <div className="animate-pulse rounded-lg border border-slate-700 bg-slate-800/50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Clock className="h-5 w-5 text-slate-600" aria-hidden="true" />
        <div className="h-5 w-24 rounded bg-slate-700"></div>
      </div>

      {/* Time displays */}
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 rounded bg-slate-700"></div>
            <div className="h-8 w-20 rounded bg-slate-700"></div>
            <div className="h-3 w-16 rounded bg-slate-700"></div>
          </div>
        ))}
      </div>

      {/* Status indicator */}
      <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-700 pt-4">
        <div className="h-2 w-2 rounded-full bg-slate-600"></div>
        <div className="h-3 w-16 rounded bg-slate-700"></div>
      </div>
    </div>
  );
}

/**
 * Dashboard skeleton loader
 * @returns Dashboard skeleton JSX
 */
export function DashboardSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="animate-pulse text-center">
        <div className="mx-auto mb-4 h-10 w-80 rounded bg-slate-700"></div>
        <div className="mx-auto mb-2 h-4 w-60 rounded bg-slate-700"></div>
        <div className="mx-auto h-3 w-40 rounded bg-slate-700"></div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content area */}
        <div className="space-y-6 lg:col-span-2">
          {/* Rover selector skeleton */}
          <div className="animate-pulse">
            <div className="flex gap-2">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-24 rounded-lg bg-slate-700"
                ></div>
              ))}
            </div>
          </div>

          {/* Weather cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <WeatherCardSkeleton />
            <WeatherCardSkeleton />
          </div>

          {/* Chart area */}
          <ChartSkeleton />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <MarsClockSkeleton />

          {/* Additional sidebar content */}
          <div className="animate-pulse rounded-lg border border-slate-700 bg-slate-800/50 p-6">
            <div className="mb-4 h-5 w-20 rounded bg-slate-700"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-16 rounded bg-slate-700"></div>
                  <div className="h-4 w-12 rounded bg-slate-700"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Pulse loading animation for inline elements
 * @param props - Pulse props
 * @returns Pulse animation JSX
 */
export function PulseLoader({
  className = 'h-4 w-16 bg-slate-700',
}: {
  className?: string;
}): React.ReactElement {
  return (
    <div className={`animate-pulse rounded ${className}`} aria-hidden="true" />
  );
}

/**
 * Loading state with custom icon
 * @param props - Icon loading props
 * @returns Icon loading JSX
 */
export function IconLoadingState({
  icon: Icon,
  text,
  subText,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  subText?: string;
}): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="mb-4"
      >
        <Icon className="h-12 w-12 text-red-400" />
      </motion.div>

      <h3 className="mb-2 text-lg font-medium text-white">{text}</h3>

      {subText && (
        <p className="text-sm text-slate-400" aria-live="polite">
          {subText}
        </p>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 flex space-x-1"
        aria-hidden="true"
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="h-2 w-2 rounded-full bg-red-400"
          />
        ))}
      </motion.div>
    </div>
  );
}

/**
 * Loading wrapper that shows loading state until children are ready
 * @param props - Loading wrapper props
 * @returns Loading wrapper JSX
 */
export function LoadingWrapper({
  isLoading,
  children,
  skeleton,
  loadingText,
}: {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  loadingText?: string;
}): React.ReactElement {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={loadingText || 'Loading content'}
      >
        {skeleton || (
          <MarsLoadingAnimation text={loadingText || 'Loading...'} />
        )}
      </div>
    );
  }

  return <>{children}</>;
}
