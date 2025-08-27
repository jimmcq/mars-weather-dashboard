/**
 * Weather feature exports
 * Centralizes all weather-related components and utilities
 */

// Main components
export { WeatherDashboard } from './WeatherDashboard';
export type { WeatherDashboardProps } from './WeatherDashboard';
export { HistoricalTrends } from './HistoricalTrends';
export type { HistoricalTrendsProps } from './HistoricalTrends';

// Hooks
export { useWeatherData } from './useWeatherData';
export type {
  UseWeatherDataOptions,
  UseWeatherDataReturn,
} from './useWeatherData';

// Services
export { WeatherService } from './weather-service';
