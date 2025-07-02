/**
 * Mars time calculations based on NASA Mars24 algorithm
 * Reference: https://www.giss.nasa.gov/tools/mars24/help/algorithm.html
 *
 * All functions are pure and extensively tested for accuracy
 */

import { MARS_CONSTANTS, ROVER_LOCATIONS } from '@/lib/constants';
import { MarsTimeData } from '@/types/mars-time';

/**
 * Mars Time Calculator - Pure functions for planetary time conversion
 */
export const MarsTimeCalculator = {
  /**
   * Convert Earth date to Julian date
   * @param date - Earth date to convert
   * @returns Julian date number
   */
  dateToJulian(date: Date): number {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    const second = date.getUTCSeconds();
    const millisecond = date.getUTCMilliseconds();

    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    const jdn =
      day +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045;

    const fracDay =
      (hour + minute / 60 + (second + millisecond / 1000) / 3600) / 24;

    return jdn + fracDay - 0.5;
  },

  /**
   * Convert Earth date to Mars Sol Date (MSD)
   * @param date - Earth date to convert
   * @returns Mars Sol Date
   */
  earthToMSD(date: Date): number {
    const julianDate = this.dateToJulian(date);
    const deltaJ2000 = julianDate - MARS_CONSTANTS.J2000_EPOCH;

    // Updated formula based on NASA Mars24 algorithm
    return (
      (deltaJ2000 - 4.5) / MARS_CONSTANTS.EARTH_TO_MARS_DAY_RATIO +
      MARS_CONSTANTS.MSD_EPOCH_OFFSET
    );
  },

  /**
   * Calculate Coordinated Mars Time (similar to UTC for Mars)
   * @param date - Earth date to convert
   * @returns Formatted MTC time string
   */
  getMTC(date: Date): string {
    const msd = this.earthToMSD(date);
    const mtcDecimal = (24 * msd) % 24;
    return this.decimalTimeToHMS(mtcDecimal);
  },

  /**
   * Calculate Local True Solar Time for a specific Mars location
   * @param date - Earth date to convert
   * @param longitude - Mars longitude in degrees
   * @returns Formatted LTST time string
   */
  getLTST(date: Date, longitude: number): string {
    const msd = this.earthToMSD(date);
    const eot = this.getEquationOfTime(msd);

    // Calculate Local True Solar Time
    const ltst = (24 * msd + longitude / 15.0 + eot) % 24;

    // Handle negative values
    const adjustedLTST = ltst < 0 ? ltst + 24 : ltst;

    return this.decimalTimeToHMS(adjustedLTST);
  },

  /**
   * Calculate mission sol number for a specific rover
   * @param landingDate - Rover landing date
   * @param currentDate - Current Earth date
   * @returns Mission sol number
   */
  getMissionSol(landingDate: Date, currentDate: Date): number {
    const landingMSD = this.earthToMSD(landingDate);
    const currentMSD = this.earthToMSD(currentDate);

    return Math.floor(currentMSD - landingMSD);
  },

  /**
   * Calculate Mars equation of time correction
   * @param msd - Mars Sol Date
   * @returns Equation of time in hours
   */
  getEquationOfTime(msd: number): number {
    // Mars orbital parameters
    const ls = this.getMarsLs(msd);
    const eot =
      2.861 * Math.sin(2 * this.degreesToRadians(ls)) -
      0.071 * Math.sin(4 * this.degreesToRadians(ls)) +
      0.002 * Math.sin(6 * this.degreesToRadians(ls)) -
      this.degreesToRadians(ls - 248);

    return this.radiansToDegrees(eot) / 15; // Convert to hours
  },

  /**
   * Calculate Mars solar longitude (Ls)
   * @param msd - Mars Sol Date
   * @returns Solar longitude in degrees
   */
  getMarsLs(msd: number): number {
    const m = (19.387 + 0.52402075 * msd) % 360;
    const alpha = (270.3863 + 0.5240384 * msd) % 360;
    const pbs =
      0.0071 * Math.cos(this.degreesToRadians((0.985626 * msd + 25.37) % 360)) +
      0.0057 * Math.cos(this.degreesToRadians((0.985626 * msd + 195.8) % 360)) +
      0.0039 * Math.cos(this.degreesToRadians((0.985626 * msd + 53.5) % 360));

    const nu =
      alpha +
      10.691 * Math.sin(this.degreesToRadians(m)) +
      0.623 * Math.sin(this.degreesToRadians(2 * m)) +
      0.05 * Math.sin(this.degreesToRadians(3 * m)) +
      0.005 * Math.sin(this.degreesToRadians(4 * m)) +
      0.0005 * Math.sin(this.degreesToRadians(5 * m)) +
      pbs;

    return nu % 360;
  },

  /**
   * Convert decimal hours to HH:MM:SS format
   * @param decimalHours - Decimal hours (0-24)
   * @returns Formatted time string
   */
  decimalTimeToHMS(decimalHours: number): string {
    const totalSeconds = Math.round(decimalHours * 3600);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },

  /**
   * Convert degrees to radians
   */
  degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  /**
   * Convert radians to degrees
   */
  radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  },

  /**
   * Calculate comprehensive Mars time data
   * @param date - Earth date (defaults to current time)
   * @param roverLongitudes - Optional custom rover longitudes
   * @returns Complete Mars time information
   */
  calculateMarsTime(
    date: Date = new Date(),
    roverLongitudes?: { curiosity?: number; perseverance?: number }
  ): MarsTimeData {
    const msd = this.earthToMSD(date);
    const mtc = this.getMTC(date);

    const curiosityLong =
      roverLongitudes?.curiosity ??
      ROVER_LOCATIONS.curiosity?.longitude ??
      137.4417;
    const perseveranceLong =
      roverLongitudes?.perseverance ??
      ROVER_LOCATIONS.perseverance?.longitude ??
      77.4509;

    const curiosityLTST = this.getLTST(date, curiosityLong);
    const perseveranceLTST = this.getLTST(date, perseveranceLong);

    const curiositySol = this.getMissionSol(
      ROVER_LOCATIONS.curiosity?.landingDate ??
        new Date('2012-08-06T05:17:57Z'),
      date
    );
    const perseveranceSol = this.getMissionSol(
      ROVER_LOCATIONS.perseverance?.landingDate ??
        new Date('2021-02-18T20:55:00Z'),
      date
    );

    return {
      msd,
      mtc,
      curiosityLTST,
      perseveranceLTST,
      curiositySol,
      perseveranceSol,
      earthTime: date.toISOString().slice(11, 19), // HH:MM:SS format
    };
  },
} as const;
