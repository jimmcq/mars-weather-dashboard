/**
 * Mars Weather Historical Trends Component
 * Displays interactive charts showing weather patterns and seasonal changes
 */

'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Calendar,
  Thermometer,
  Gauge,
  Wind,
  BarChart3,
  LineChart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { RoverName } from '@/types/weather';
import { useWeatherData } from './useWeatherData';

/** Chart type options */
type ChartType = 'line' | 'area';

/** Metric to display */
type MetricType = 'temperature' | 'pressure' | 'wind';

/** Time range options */
type TimeRange = '7d' | '14d' | '30d';

/** Component props */
export interface HistoricalTrendsProps {
  /** Initial rover selection */
  initialRover?: RoverName;
  /** Component CSS class name */
  className?: string;
}

/** Custom tooltip component for recharts */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: Record<string, unknown>;
  }>;
  label?: string;
}): React.ReactElement | null {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg border border-slate-600 bg-slate-800/95 p-3 shadow-lg backdrop-blur">
      <p className="mb-2 font-semibold text-white">{label}</p>
      {payload.map((entry, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {`${entry.name}: ${entry.value}${entry.payload?.unit || ''}`}
        </p>
      ))}
    </div>
  );
}

/**
 * Historical Trends Component
 * Shows interactive weather trend charts
 */
export function HistoricalTrends({
  initialRover = 'curiosity',
  className = '',
}: HistoricalTrendsProps): React.ReactElement {
  const [selectedRover, setSelectedRover] = useState<RoverName>(initialRover);
  const [selectedMetric, setSelectedMetric] =
    useState<MetricType>('temperature');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // Fetch historical data for the selected rover
  const { data, isLoading } = useWeatherData(selectedRover, {
    historyDays: 30,
    autoRefetch: false, // Don't auto-refresh for trends
  });

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!data?.history?.length) return [];

    const sortedData = [...data.history].sort((a, b) => a.sol - b.sol);

    switch (timeRange) {
      case '7d':
        return sortedData.slice(-7);
      case '14d':
        return sortedData.slice(-14);
      case '30d':
      default:
        return sortedData;
    }
  }, [data, timeRange]);

  // Prepare chart data based on selected metric
  const chartData = useMemo(() => {
    return filteredData.map((sol) => {
      const baseData = {
        sol: sol.sol,
        date: sol.earthDate,
        label: `Sol ${sol.sol}`,
        unit: '',
      };

      switch (selectedMetric) {
        case 'temperature':
          return {
            ...baseData,
            min: Math.round(sol.temperature.min * 10) / 10,
            avg: Math.round(sol.temperature.average * 10) / 10,
            max: Math.round(sol.temperature.max * 10) / 10,
            unit: '°C',
          };
        case 'pressure':
          return {
            ...baseData,
            pressure: Math.round((sol.atmosphere.pressure / 100) * 10) / 10,
            unit: 'hPa',
          };
        case 'wind':
          return {
            ...baseData,
            speed: sol.wind ? Math.round(sol.wind.speed * 10) / 10 : 0,
            unit: 'm/s',
          };
        default:
          return baseData;
      }
    });
  }, [filteredData, selectedMetric]);

  // Get metric configuration
  const getMetricConfig = (
    metric: MetricType
  ): {
    icon: React.ElementType;
    title: string;
    colors: Record<string, string>;
  } => {
    switch (metric) {
      case 'temperature':
        return {
          icon: Thermometer,
          title: 'Temperature Trends',
          colors: {
            min: '#3b82f6', // blue
            avg: '#f59e0b', // amber
            max: '#ef4444', // red
          },
        };
      case 'pressure':
        return {
          icon: Gauge,
          title: 'Atmospheric Pressure',
          colors: {
            pressure: '#8b5cf6', // purple
          },
        };
      case 'wind':
        return {
          icon: Wind,
          title: 'Wind Speed',
          colors: {
            speed: '#10b981', // emerald
          },
        };
    }
  };

  const metricConfig = getMetricConfig(selectedMetric);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur ${className}`}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-slate-700"></div>
          <div className="h-64 rounded bg-slate-700"></div>
          <div className="flex space-x-2">
            <div className="h-8 w-20 rounded bg-slate-700"></div>
            <div className="h-8 w-20 rounded bg-slate-700"></div>
            <div className="h-8 w-20 rounded bg-slate-700"></div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data?.history?.length) {
    return (
      <div
        className={`rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur ${className}`}
      >
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">
            Historical Trends
          </h3>
        </div>
        <div className="py-8 text-center text-slate-400">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p>No historical data available</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur ${className}`}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">
            Historical Trends
          </h3>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {/* Rover selector */}
          <div className="flex rounded-lg bg-slate-700 p-1">
            {(['curiosity', 'perseverance'] as RoverName[]).map((rover) => (
              <button
                key={rover}
                onClick={() => setSelectedRover(rover)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-all ${
                  selectedRover === rover
                    ? 'bg-red-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {rover === 'curiosity' ? 'Curiosity' : 'Perseverance'}
              </button>
            ))}
          </div>

          {/* Metric selector */}
          <div className="flex rounded-lg bg-slate-700 p-1">
            {(['temperature', 'pressure', 'wind'] as MetricType[]).map(
              (metric) => {
                const Icon = getMetricConfig(metric).icon;
                return (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium transition-all ${
                      selectedMetric === metric
                        ? 'bg-orange-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {metric}
                  </button>
                );
              }
            )}
          </div>

          {/* Chart type selector */}
          <div className="flex rounded-lg bg-slate-700 p-1">
            {(['line', 'area'] as ChartType[]).map((type) => {
              const Icon = type === 'line' ? LineChart : BarChart3;
              return (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium transition-all ${
                    chartType === type
                      ? 'bg-slate-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                </button>
              );
            })}
          </div>

          {/* Time range selector */}
          <div className="flex rounded-lg bg-slate-700 p-1">
            {(['7d', '14d', '30d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                {selectedMetric === 'temperature' && (
                  <>
                    <linearGradient
                      id="minGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={metricConfig.colors.min}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={metricConfig.colors.min}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="avgGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={metricConfig.colors.avg}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={metricConfig.colors.avg}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="maxGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={metricConfig.colors.max}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={metricConfig.colors.max}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </>
                )}
                {selectedMetric === 'pressure' && (
                  <linearGradient
                    id="pressureGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={metricConfig.colors.pressure}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={metricConfig.colors.pressure}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                )}
                {selectedMetric === 'wind' && (
                  <linearGradient
                    id="speedGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={metricConfig.colors.speed}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={metricConfig.colors.speed}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="sol"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
              />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {selectedMetric === 'temperature' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="min"
                    stackId="1"
                    stroke={metricConfig.colors.min || '#3b82f6'}
                    fill="url(#minGradient)"
                    name="Min Temp"
                  />
                  <Area
                    type="monotone"
                    dataKey="avg"
                    stackId="2"
                    stroke={metricConfig.colors.avg || '#f59e0b'}
                    fill="url(#avgGradient)"
                    name="Avg Temp"
                  />
                  <Area
                    type="monotone"
                    dataKey="max"
                    stackId="3"
                    stroke={metricConfig.colors.max || '#ef4444'}
                    fill="url(#maxGradient)"
                    name="Max Temp"
                  />
                </>
              )}

              {selectedMetric === 'pressure' && (
                <Area
                  type="monotone"
                  dataKey="pressure"
                  stroke={metricConfig.colors.pressure || '#8b5cf6'}
                  fill="url(#pressureGradient)"
                  name="Pressure"
                />
              )}

              {selectedMetric === 'wind' && (
                <Area
                  type="monotone"
                  dataKey="speed"
                  stroke={metricConfig.colors.speed || '#10b981'}
                  fill="url(#speedGradient)"
                  name="Wind Speed"
                />
              )}
            </AreaChart>
          ) : (
            <RechartsLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="sol"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
              />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {selectedMetric === 'temperature' && (
                <>
                  <Line
                    type="monotone"
                    dataKey="min"
                    stroke={metricConfig.colors.min || '#3b82f6'}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Min Temp"
                  />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke={metricConfig.colors.avg || '#f59e0b'}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Avg Temp"
                  />
                  <Line
                    type="monotone"
                    dataKey="max"
                    stroke={metricConfig.colors.max || '#ef4444'}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Max Temp"
                  />
                </>
              )}

              {selectedMetric === 'pressure' && (
                <Line
                  type="monotone"
                  dataKey="pressure"
                  stroke={metricConfig.colors.pressure || '#8b5cf6'}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Pressure"
                />
              )}

              {selectedMetric === 'wind' && (
                <Line
                  type="monotone"
                  dataKey="speed"
                  stroke={metricConfig.colors.speed || '#10b981'}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Wind Speed"
                />
              )}
            </RechartsLineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart info */}
      <div className="mt-4 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <span>Showing {chartData.length} sols of data</span>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {filteredData.length > 0 &&
                `${filteredData[0]?.earthDate} - ${filteredData[filteredData.length - 1]?.earthDate}`}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
