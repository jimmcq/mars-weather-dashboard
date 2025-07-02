/**
 * Comprehensive tests for Mars time calculations
 * Reference data from NASA Mars24 tool and JPL ephemeris
 */

import { MarsTimeCalculator } from '@/features/mars-time/time-conversion';
import { ROVER_LOCATIONS } from '@/lib/constants';

describe('MarsTimeCalculator', () => {
  describe('dateToJulian', () => {
    test('converts known reference dates correctly', () => {
      // J2000.0 epoch: 2000-01-01 12:00:00 UTC
      const j2000 = new Date('2000-01-01T12:00:00.000Z');
      const julianDate = MarsTimeCalculator.dateToJulian(j2000);
      
      expect(julianDate).toBeCloseTo(2451545.0, 8);
    });

    test('handles Unix epoch correctly', () => {
      // Unix epoch: 1970-01-01 00:00:00 UTC  
      const unixEpoch = new Date('1970-01-01T00:00:00.000Z');
      const julianDate = MarsTimeCalculator.dateToJulian(unixEpoch);
      
      expect(julianDate).toBeCloseTo(2440587.5, 8);
    });

    test('handles leap year dates correctly', () => {
      // Leap year date: 2020-02-29 12:00:00 UTC
      const leapDate = new Date('2020-02-29T12:00:00.000Z');
      const julianDate = MarsTimeCalculator.dateToJulian(leapDate);
      
      expect(julianDate).toBeCloseTo(2458909.0, 8);
    });
  });

  describe('earthToMSD', () => {
    test('converts J2000.0 epoch to correct MSD', () => {
      const j2000 = new Date('2000-01-01T12:00:00.000Z');
      const msd = MarsTimeCalculator.earthToMSD(j2000);
      
      // Verify MSD is in reasonable range for J2000.0
      expect(msd).toBeGreaterThan(44790);
      expect(msd).toBeLessThan(44800);
    });

    test('handles Curiosity landing date correctly', () => {
      const landingDate = new Date('2012-08-06T05:17:57.000Z');
      const msd = MarsTimeCalculator.earthToMSD(landingDate);
      
      // Verify MSD is in reasonable range for Curiosity landing
      expect(msd).toBeGreaterThan(49260);
      expect(msd).toBeLessThan(49280);
    });

    test('handles Perseverance landing date correctly', () => {
      const landingDate = new Date('2021-02-18T20:55:00.000Z');
      const msd = MarsTimeCalculator.earthToMSD(landingDate);
      
      // Verify MSD is in reasonable range for Perseverance landing
      expect(msd).toBeGreaterThan(52300);
      expect(msd).toBeLessThan(52320);
    });

    test('produces monotonically increasing values', () => {
      const date1 = new Date('2023-01-01T00:00:00.000Z');
      const date2 = new Date('2023-01-02T00:00:00.000Z');
      
      const msd1 = MarsTimeCalculator.earthToMSD(date1);
      const msd2 = MarsTimeCalculator.earthToMSD(date2);
      
      expect(msd2).toBeGreaterThan(msd1);
      // Should be approximately 1 Earth day difference in MSD units
      expect(msd2 - msd1).toBeGreaterThan(0.9);
      expect(msd2 - msd1).toBeLessThan(1.1);
    });
  });

  describe('getMTC', () => {
    test('returns valid time format', () => {
      const testDate = new Date('2023-07-01T12:00:00.000Z');
      const mtc = MarsTimeCalculator.getMTC(testDate);
      
      expect(mtc).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    test('produces consistent values for same date', () => {
      const testDate = new Date('2023-07-01T12:00:00.000Z');
      const mtc1 = MarsTimeCalculator.getMTC(testDate);
      const mtc2 = MarsTimeCalculator.getMTC(testDate);
      
      expect(mtc1).toBe(mtc2);
    });

    test('handles midnight boundary correctly', () => {
      const testDate = new Date('2023-07-01T00:00:00.000Z');
      const mtc = MarsTimeCalculator.getMTC(testDate);
      
      expect(mtc).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      
      // Parse hours to ensure valid range
      const hours = parseInt(mtc.split(':')[0]);
      expect(hours).toBeGreaterThanOrEqual(0);
      expect(hours).toBeLessThan(24);
    });
  });

  describe('getLTST', () => {
    test('returns valid time format for Curiosity location', () => {
      const testDate = new Date('2023-07-01T12:00:00.000Z');
      const ltst = MarsTimeCalculator.getLTST(testDate, ROVER_LOCATIONS.curiosity.longitude);
      
      expect(ltst).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    test('returns valid time format for Perseverance location', () => {
      const testDate = new Date('2023-07-01T12:00:00.000Z');
      const ltst = MarsTimeCalculator.getLTST(testDate, ROVER_LOCATIONS.perseverance.longitude);
      
      expect(ltst).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    test('handles different longitudes correctly', () => {
      const testDate = new Date('2023-07-01T12:00:00.000Z');
      
      const ltst1 = MarsTimeCalculator.getLTST(testDate, 0); // Prime meridian
      const ltst2 = MarsTimeCalculator.getLTST(testDate, 180); // Opposite side
      
      expect(ltst1).not.toBe(ltst2);
    });

    test('handles negative longitudes correctly', () => {
      const testDate = new Date('2023-07-01T12:00:00.000Z');
      const ltst = MarsTimeCalculator.getLTST(testDate, -45);
      
      expect(ltst).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      
      const hours = parseInt(ltst.split(':')[0]);
      expect(hours).toBeGreaterThanOrEqual(0);
      expect(hours).toBeLessThan(24);
    });
  });

  describe('getMissionSol', () => {
    test('calculates Curiosity sol correctly for landing date', () => {
      const landingDate = ROVER_LOCATIONS.curiosity.landingDate;
      const sol = MarsTimeCalculator.getMissionSol(landingDate, landingDate);
      
      expect(sol).toBe(0);
    });

    test('calculates Perseverance sol correctly for landing date', () => {
      const landingDate = ROVER_LOCATIONS.perseverance.landingDate;
      const sol = MarsTimeCalculator.getMissionSol(landingDate, landingDate);
      
      expect(sol).toBe(0);
    });

    test('calculates positive sol numbers for future dates', () => {
      const landingDate = ROVER_LOCATIONS.curiosity.landingDate;
      const futureDate = new Date(landingDate.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 Earth days later
      
      const sol = MarsTimeCalculator.getMissionSol(landingDate, futureDate);
      
      expect(sol).toBeGreaterThan(0);
      expect(sol).toBeLessThan(20); // Should be around 9-10 sols
    });

    test('handles year boundaries correctly', () => {
      const landingDate = new Date('2020-12-31T12:00:00.000Z');
      const nextYear = new Date('2021-01-01T12:00:00.000Z');
      
      const sol = MarsTimeCalculator.getMissionSol(landingDate, nextYear);
      
      expect(sol).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getEquationOfTime', () => {
    test('returns reasonable values', () => {
      const testMSD = 50000; // Arbitrary test MSD
      const eot = MarsTimeCalculator.getEquationOfTime(testMSD);
      
      // Mars equation of time should be within reasonable bounds (±6 hours for Mars)
      expect(Math.abs(eot)).toBeLessThan(6);
    });

    test('varies throughout Mars year', () => {
      const msd1 = 50000;
      const msd2 = 50000 + 334; // ~half Mars year later
      
      const eot1 = MarsTimeCalculator.getEquationOfTime(msd1);
      const eot2 = MarsTimeCalculator.getEquationOfTime(msd2);
      
      // Should produce different values
      expect(Math.abs(eot1 - eot2)).toBeGreaterThan(0.01);
    });
  });

  describe('decimalTimeToHMS', () => {
    test('converts whole hours correctly', () => {
      expect(MarsTimeCalculator.decimalTimeToHMS(12.0)).toBe('12:00:00');
      expect(MarsTimeCalculator.decimalTimeToHMS(0.0)).toBe('00:00:00');
      expect(MarsTimeCalculator.decimalTimeToHMS(23.0)).toBe('23:00:00');
    });

    test('converts fractional hours correctly', () => {
      expect(MarsTimeCalculator.decimalTimeToHMS(12.5)).toBe('12:30:00');
      expect(MarsTimeCalculator.decimalTimeToHMS(1.25)).toBe('01:15:00');
      expect(MarsTimeCalculator.decimalTimeToHMS(23.999722)).toBe('23:59:59');
    });

    test('handles edge cases', () => {
      expect(MarsTimeCalculator.decimalTimeToHMS(0.0166666)).toBe('00:01:00'); // 1 minute
      expect(MarsTimeCalculator.decimalTimeToHMS(0.0027777)).toBe('00:00:10'); // 10 seconds
    });
  });

  describe('angle conversions', () => {
    test('converts degrees to radians correctly', () => {
      expect(MarsTimeCalculator.degreesToRadians(0)).toBe(0);
      expect(MarsTimeCalculator.degreesToRadians(90)).toBeCloseTo(Math.PI / 2, 10);
      expect(MarsTimeCalculator.degreesToRadians(180)).toBeCloseTo(Math.PI, 10);
      expect(MarsTimeCalculator.degreesToRadians(360)).toBeCloseTo(2 * Math.PI, 10);
    });

    test('converts radians to degrees correctly', () => {
      expect(MarsTimeCalculator.radiansToDegrees(0)).toBe(0);
      expect(MarsTimeCalculator.radiansToDegrees(Math.PI / 2)).toBeCloseTo(90, 10);
      expect(MarsTimeCalculator.radiansToDegrees(Math.PI)).toBeCloseTo(180, 10);
      expect(MarsTimeCalculator.radiansToDegrees(2 * Math.PI)).toBeCloseTo(360, 10);
    });

    test('round-trip conversions are accurate', () => {
      const testDegrees = 45.5;
      const radians = MarsTimeCalculator.degreesToRadians(testDegrees);
      const backToDegrees = MarsTimeCalculator.radiansToDegrees(radians);
      
      expect(backToDegrees).toBeCloseTo(testDegrees, 10);
    });
  });

  describe('calculateMarsTime', () => {
    test('returns complete Mars time data', () => {
      const testDate = new Date('2023-07-01T12:00:00.000Z');
      const marsTime = MarsTimeCalculator.calculateMarsTime(testDate);
      
      expect(marsTime).toHaveProperty('msd');
      expect(marsTime).toHaveProperty('mtc');
      expect(marsTime).toHaveProperty('curiosityLTST');
      expect(marsTime).toHaveProperty('perseveranceLTST');
      expect(marsTime).toHaveProperty('curiositySol');
      expect(marsTime).toHaveProperty('perseveranceSol');
      expect(marsTime).toHaveProperty('earthTime');
      
      expect(typeof marsTime.msd).toBe('number');
      expect(marsTime.mtc).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(marsTime.curiosityLTST).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(marsTime.perseveranceLTST).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(typeof marsTime.curiositySol).toBe('number');
      expect(typeof marsTime.perseveranceSol).toBe('number');
      expect(marsTime.earthTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    test('uses current time when no date provided', () => {
      const marsTime1 = MarsTimeCalculator.calculateMarsTime();
      
      // Wait a small amount and calculate again
      setTimeout(() => {
        const marsTime2 = MarsTimeCalculator.calculateMarsTime();
        
        // Should be slightly different (though may be same due to precision)
        expect(marsTime2.msd).toBeGreaterThanOrEqual(marsTime1.msd);
      }, 10);
    });

    test('produces reasonable sol numbers for current mission', () => {
      const currentDate = new Date();
      const marsTime = MarsTimeCalculator.calculateMarsTime(currentDate);
      
      // As of 2023, Curiosity should have thousands of sols
      expect(marsTime.curiositySol).toBeGreaterThan(3000);
      
      // Perseverance started in 2021, should have hundreds of sols
      expect(marsTime.perseveranceSol).toBeGreaterThan(800);
    });
  });

  describe('edge cases and error handling', () => {
    test('handles very old dates', () => {
      const oldDate = new Date('1900-01-01T00:00:00.000Z');
      const marsTime = MarsTimeCalculator.calculateMarsTime(oldDate);
      
      expect(typeof marsTime.msd).toBe('number');
      expect(marsTime.mtc).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    test('handles far future dates', () => {
      const futureDate = new Date('2100-01-01T00:00:00.000Z');
      const marsTime = MarsTimeCalculator.calculateMarsTime(futureDate);
      
      expect(typeof marsTime.msd).toBe('number');
      expect(marsTime.mtc).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    test('handles leap second boundaries', () => {
      // Test around known leap second (2016-12-31T23:59:60)
      const beforeLeap = new Date('2016-12-31T23:59:59.000Z');
      const afterLeap = new Date('2017-01-01T00:00:01.000Z');
      
      const marsTime1 = MarsTimeCalculator.calculateMarsTime(beforeLeap);
      const marsTime2 = MarsTimeCalculator.calculateMarsTime(afterLeap);
      
      expect(marsTime2.msd).toBeGreaterThan(marsTime1.msd);
    });
  });
});