/**
 * Weather data types for Mars rover environmental measurements
 * Based on NASA REMS (Curiosity) and MEDA (Perseverance) instruments
 */

/** Supported rover names */
export type RoverName = 'curiosity' | 'perseverance';

/** Weather instrument names */
export type InstrumentName = 'REMS' | 'MEDA' | 'TWINS';

/** Data quality indicators */
export type DataQuality = 'complete' | 'partial' | 'estimated' | 'unavailable';

/** Temperature units */
export type TemperatureUnit = 'celsius' | 'fahrenheit';

/** Pressure units */
export type PressureUnit = 'pa' | 'hpa' | 'mbar';

/** Wind speed units */
export type WindUnit = 'mps' | 'kph' | 'mph';

/** Temperature data structure */
export interface TemperatureData {
  /** Minimum temperature for the sol */
  min: number;
  /** Maximum temperature for the sol */
  max: number;
  /** Average temperature for the sol */
  average: number;
  /** Temperature unit */
  unit: TemperatureUnit;
  /** Measurement quality */
  quality: DataQuality;
}

/** Atmospheric pressure data */
export interface AtmosphericData {
  /** Atmospheric pressure reading */
  pressure: number;
  /** Pressure unit */
  unit: PressureUnit;
  /** Relative humidity (if available) */
  humidity?: number;
  /** Measurement quality */
  quality: DataQuality;
}

/** Wind measurement data */
export interface WindData {
  /** Wind speed */
  speed: number;
  /** Wind direction in degrees (0-360) */
  direction?: number;
  /** Wind speed unit */
  unit: WindUnit;
  /** Measurement quality */
  quality: DataQuality;
}

/** UV radiation data (if available) */
export interface UVData {
  /** UV index or irradiance */
  level: number;
  /** UV measurement unit */
  unit: string;
  /** Measurement quality */
  quality: DataQuality;
}

/** Rover location information */
export interface RoverLocation {
  /** Mars latitude in degrees */
  latitude: number;
  /** Mars longitude in degrees */
  longitude: number;
  /** Rover landing date */
  landingDate: string;
  /** Location name (e.g., "Gale Crater") */
  locationName: string;
}

/** Single sol weather data (normalized format) */
export interface MarsWeatherSol {
  /** Mars sol number */
  sol: number;
  /** Earth date for this sol */
  earthDate: string;
  /** Temperature measurements */
  temperature: TemperatureData;
  /** Atmospheric conditions */
  atmosphere: AtmosphericData;
  /** Wind measurements (if available) */
  wind?: WindData;
  /** UV radiation (if available) */
  uv?: UVData;
  /** Source rover */
  rover: RoverName;
  /** Measurement instrument */
  instrument: InstrumentName;
  /** Overall data quality for this sol */
  dataQuality: DataQuality;
  /** Rover location at time of measurement */
  location: RoverLocation;
  /** Timestamp when data was last updated */
  lastUpdated: string;
}

/** Weather data collection for multiple sols */
export interface MarsWeatherData {
  /** Latest sol data */
  latest: MarsWeatherSol;
  /** Historical data (last 7 sols) */
  history: MarsWeatherSol[];
  /** Rover information */
  rover: RoverName;
  /** Data freshness indicator */
  lastFetch: string;
  /** API status */
  status: 'success' | 'partial' | 'error';
}

/** Weather API response structure */
export interface WeatherApiResponse {
  /** Weather data */
  data: MarsWeatherData;
  /** Response metadata */
  meta: {
    /** Total number of sols available */
    totalSols: number;
    /** API request timestamp */
    requestTime: string;
    /** Cache information */
    cached: boolean;
    /** Cache expiry time */
    cacheExpiry?: string;
  };
}

/** Weather API error response */
export interface WeatherApiError {
  /** Error message */
  error: string;
  /** Error code */
  code: string;
  /** Detailed error information */
  details?: Record<string, unknown>;
  /** Timestamp of error */
  timestamp: string;
}

/** Options for weather data fetching */
export interface WeatherDataOptions {
  /** Number of historical sols to include */
  historyDays?: number;
  /** Temperature unit preference */
  temperatureUnit?: TemperatureUnit;
  /** Pressure unit preference */
  pressureUnit?: PressureUnit;
  /** Wind unit preference */
  windUnit?: WindUnit;
  /** Include estimated/partial data */
  includeEstimated?: boolean;
}

/** Raw NASA API response types (for transformation) */
export interface NASAPhotoApiResponse {
  latest_photos: Array<{
    id: number;
    sol: number;
    camera: {
      id: number;
      name: string;
      rover_id: number;
      full_name: string;
    };
    img_src: string;
    earth_date: string;
    rover: {
      id: number;
      name: string;
      landing_date: string;
      launch_date: string;
      status: string;
      max_sol: number;
      max_date: string;
      total_photos: number;
    };
  }>;
}

/** NASA weather RSS response structure */
export interface NASAWeatherRSSResponse {
  rss: {
    channel: {
      title: string;
      description: string;
      item: Array<{
        title: string;
        description: string;
        pubDate: string;
        'dc:date': string;
        link: string;
      }>;
    };
  };
}
