/**
 * Application constants and rover data
 */

import { RoverLocation } from '@/types/mars-time';

/** Mars planetary constants based on NASA Mars24 algorithm */
export const MARS_CONSTANTS = {
  /** Mars solar day length in Earth seconds */
  SOL_DURATION_SECONDS: 88775.244147, // 24h 37m 22.66s
  
  /** Mars Sol Date epoch offset */
  MSD_EPOCH_OFFSET: 44796.0,
  
  /** Earth days per Mars sol ratio */
  EARTH_TO_MARS_DAY_RATIO: 1.027491252,
  
  /** Julian date for J2000.0 epoch */
  J2000_EPOCH: 2451545.0,
  
  /** Mars orbital eccentricity */
  ORBITAL_ECCENTRICITY: 0.09340,
  
  /** Mars mean motion (degrees per sol) */
  MEAN_MOTION: 0.524021,
} as const;

/** NASA rover locations and mission data */
export const ROVER_LOCATIONS: Record<string, RoverLocation> = {
  curiosity: {
    name: 'Curiosity',
    longitude: 137.4417, // Gale Crater
    latitude: -4.5895,
    landingDate: new Date('2012-08-06T05:17:57Z'),
    landingSol: 0,
  },
  perseverance: {
    name: 'Perseverance', 
    longitude: 77.4509, // Jezero Crater
    latitude: 18.4447,
    landingDate: new Date('2021-02-18T20:55:00Z'),
    landingSol: 0,
  },
} as const;

/** Time formatting options */
export const TIME_FORMAT = {
  /** Standard time display format */
  STANDARD: 'HH:mm:ss',
  
  /** Precise time with milliseconds */
  PRECISE: 'HH:mm:ss.SSS',
  
  /** Date format for sol information */
  SOL_DATE: 'PPP',
} as const;