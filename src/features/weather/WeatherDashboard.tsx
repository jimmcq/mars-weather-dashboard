/**
 * Mars Weather Dashboard Component
 * Displays current and historical weather data from Mars rovers
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cloud,
  Thermometer,
  Wind,
  Gauge,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useWeatherData } from './useWeatherData';
import { RoverName, MarsWeatherData } from '@/types/weather';
import { TermTooltip } from '@/components/TermTooltip';

/** Component props */
export interface WeatherDashboardProps {
  /** Initial data for SSR hydration */
  initialData?: MarsWeatherData | null;
  /** Initial rover selection */
  initialRover?: RoverName;
}

/**
 * Main weather dashboard component
 * Follows the same patterns as MartianClock for consistency
 */
export function WeatherDashboard({
  initialData = null,
  initialRover = 'curiosity',
}: WeatherDashboardProps): React.ReactElement {
  const [selectedRover, setSelectedRover] = useState<RoverName>(initialRover);
  const { data, isLoading, error, refetch, lastFetch } = useWeatherData(
    selectedRover,
    {
      initialData,
      historyDays: 7,
      autoRefetch: true,
      updateInterval: 5 * 60 * 1000, // 5 minutes
    }
  );

  /**
   * Loading state component
   */
  if (isLoading && !data) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <Cloud className="h-5 w-5 animate-pulse text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Mars Weather</h3>
        </div>
        <div className="space-y-4">
          {/* Loading skeleton */}
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-3/4 rounded bg-slate-700"></div>
            <div className="h-8 w-1/2 rounded bg-slate-700"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 rounded bg-slate-700"></div>
              <div className="h-16 rounded bg-slate-700"></div>
            </div>
            <div className="h-24 rounded bg-slate-700"></div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Error state component
   */
  if (error && !data) {
    return (
      <div className="rounded-lg border border-red-700/50 bg-slate-800/50 p-6 backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">
            Weather Data Unavailable
          </h3>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Unable to fetch weather data: {error}
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
        <div className="text-center text-slate-400">
          No weather data available
        </div>
      </div>
    );
  }

  const { latest } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur"
    >
      {/* Header with rover selector */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Mars Weather</h3>
          {isLoading && (
            <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
          )}
        </div>

        {/* Rover selector */}
        <div className="flex rounded-lg bg-slate-700 p-1">
          {(['curiosity', 'perseverance'] as RoverName[]).map((rover) => (
            <button
              key={rover}
              onClick={() => setSelectedRover(rover)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-all ${
                selectedRover === rover
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {rover === 'curiosity' ? 'Curiosity' : 'Perseverance'}
            </button>
          ))}
        </div>
      </div>

      {/* Current conditions */}
      <div className="space-y-6">
        {/* Sol and date info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">
                <TermTooltip term="Sol">Sol</TermTooltip> {latest.sol}
              </p>
              <p className="font-medium text-white">{latest.earthDate}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">
                {latest.location.locationName}
              </p>
              <p className="text-xs text-slate-500">
                <TermTooltip term={latest.instrument}>
                  {latest.instrument}
                </TermTooltip>{' '}
                instrument
              </p>
            </div>
          </div>
        </motion.div>

        {/* Weather metrics grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {/* Temperature */}
          <div className="rounded-lg bg-slate-700/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-red-400" />
              <span className="text-sm text-slate-300">Temperature</span>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-lg text-white">
                {latest.temperature.average.toFixed(1)}°C
              </p>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Low: {latest.temperature.min.toFixed(1)}°</span>
                <span>High: {latest.temperature.max.toFixed(1)}°</span>
              </div>
            </div>
          </div>

          {/* Pressure */}
          <div className="rounded-lg bg-slate-700/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-slate-300">
                <TermTooltip term="Atmospheric Pressure">Pressure</TermTooltip>
              </span>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-lg text-white">
                {(latest.atmosphere.pressure / 100).toFixed(1)}{' '}
                <TermTooltip term="hPa">hPa</TermTooltip>
              </p>
              <p className="text-xs text-slate-400">
                {latest.atmosphere.quality} data
              </p>
            </div>
          </div>

          {/* Wind */}
          <div className="rounded-lg bg-slate-700/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Wind className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-300">Wind</span>
            </div>
            <div className="space-y-1">
              {latest.wind ? (
                <>
                  <p className="font-mono text-lg text-white">
                    {latest.wind.speed.toFixed(1)} m/s
                  </p>
                  <p className="text-xs text-slate-400">
                    {latest.wind.direction
                      ? `${latest.wind.direction}°`
                      : 'Variable'}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-400">No data</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Data quality and freshness */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="border-t border-slate-700 pt-4"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  latest.dataQuality === 'complete'
                    ? 'bg-green-500'
                    : latest.dataQuality === 'partial'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
              ></div>
              <span>
                <TermTooltip term="Data Quality">Data quality</TermTooltip>:{' '}
                {latest.dataQuality}
              </span>
            </div>
            <div>
              Last updated:{' '}
              {lastFetch ? new Date(lastFetch).toLocaleTimeString() : 'Unknown'}
            </div>
          </div>
        </motion.div>

        {/* Historical data indicator */}
        {data.history.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <p className="text-sm text-slate-400">
              Historical data: {data.history.length}{' '}
              <TermTooltip term="sol">sols</TermTooltip> available
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
