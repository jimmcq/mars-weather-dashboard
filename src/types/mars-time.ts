/**
 * Mars time-related type definitions
 */

export interface MarsTimeData {
  /** Mars Sol Date - days since Mars epoch */
  msd: number;
  
  /** Coordinated Mars Time (24-hour format) */
  mtc: string;
  
  /** Local True Solar Time for Curiosity location */
  curiosityLTST: string;
  
  /** Local True Solar Time for Perseverance location */
  perseveranceLTST: string;
  
  /** Mission sol number for Curiosity rover */
  curiositySol: number;
  
  /** Mission sol number for Perseverance rover */
  perseveranceSol: number;
  
  /** Current Earth time for reference */
  earthTime: string;
}

export interface RoverLocation {
  /** Rover name */
  name: string;
  
  /** Landing site longitude in degrees */
  longitude: number;
  
  /** Landing site latitude in degrees */
  latitude: number;
  
  /** Mission landing date */
  landingDate: Date;
  
  /** Landing sol offset */
  landingSol: number;
}

export interface MarsTimeOptions {
  /** Update interval in milliseconds */
  updateInterval?: number;
  
  /** Include subsecond precision */
  includePrecision?: boolean;
}