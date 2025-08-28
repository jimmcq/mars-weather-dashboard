/**
 * Tests for validation utilities
 */

import { ValidationUtils } from '@/lib/validation';

describe('ValidationUtils', () => {
  describe('validateRover', () => {
    test('accepts valid rover names', () => {
      const result = ValidationUtils.validateRover('curiosity');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('curiosity');

      const result2 = ValidationUtils.validateRover('perseverance');
      expect(result2.isValid).toBe(true);
      expect(result2.value).toBe('perseverance');
    });

    test('normalizes rover names with different casing', () => {
      const result = ValidationUtils.validateRover('CURIOSITY');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('curiosity');

      const result2 = ValidationUtils.validateRover(' Perseverance ');
      expect(result2.isValid).toBe(true);
      expect(result2.value).toBe('perseverance');
    });

    test('rejects invalid rover names', () => {
      const result = ValidationUtils.validateRover('invalid_rover');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid rover name');
      expect(result.code).toBe('INVALID_ROVER');
    });

    test('rejects non-string input', () => {
      const result = ValidationUtils.validateRover(123);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must be a string');
      expect(result.code).toBe('INVALID_TYPE');
    });
  });

  describe('validateHistoryDays', () => {
    test('accepts valid numbers', () => {
      const result = ValidationUtils.validateHistoryDays(7);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(7);

      const result2 = ValidationUtils.validateHistoryDays(30);
      expect(result2.isValid).toBe(true);
      expect(result2.value).toBe(30);
    });

    test('accepts valid string numbers', () => {
      const result = ValidationUtils.validateHistoryDays('15');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(15);
    });

    test('rejects out of range values', () => {
      const result = ValidationUtils.validateHistoryDays(0);
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('OUT_OF_RANGE');

      const result2 = ValidationUtils.validateHistoryDays(31);
      expect(result2.isValid).toBe(false);
      expect(result2.code).toBe('OUT_OF_RANGE');
    });

    test('rejects invalid string numbers', () => {
      const result = ValidationUtils.validateHistoryDays('invalid');
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('INVALID_NUMBER');
    });

    test('rejects invalid types', () => {
      const result = ValidationUtils.validateHistoryDays({});
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('INVALID_TYPE');
    });
  });

  describe('validateTemperatureUnit', () => {
    test('accepts valid temperature units', () => {
      const result = ValidationUtils.validateTemperatureUnit('celsius');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('celsius');

      const result2 = ValidationUtils.validateTemperatureUnit('fahrenheit');
      expect(result2.isValid).toBe(true);
      expect(result2.value).toBe('fahrenheit');
    });

    test('normalizes unit names with different casing', () => {
      const result = ValidationUtils.validateTemperatureUnit('CELSIUS');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('celsius');

      const result2 = ValidationUtils.validateTemperatureUnit(' Fahrenheit ');
      expect(result2.isValid).toBe(true);
      expect(result2.value).toBe('fahrenheit');
    });

    test('rejects invalid temperature units', () => {
      const result = ValidationUtils.validateTemperatureUnit('kelvin');
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('INVALID_UNIT');
    });

    test('rejects non-string input', () => {
      const result = ValidationUtils.validateTemperatureUnit(123);
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('INVALID_TYPE');
    });
  });

  describe('validatePressureUnit', () => {
    test('accepts valid pressure units', () => {
      ['pa', 'hpa', 'mbar'].forEach((unit) => {
        const result = ValidationUtils.validatePressureUnit(unit);
        expect(result.isValid).toBe(true);
        expect(result.value).toBe(unit);
      });
    });

    test('rejects invalid pressure units', () => {
      const result = ValidationUtils.validatePressureUnit('psi');
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('INVALID_UNIT');
    });
  });

  describe('validateWindUnit', () => {
    test('accepts valid wind units', () => {
      ['mps', 'kph', 'mph'].forEach((unit) => {
        const result = ValidationUtils.validateWindUnit(unit);
        expect(result.isValid).toBe(true);
        expect(result.value).toBe(unit);
      });
    });

    test('rejects invalid wind units', () => {
      const result = ValidationUtils.validateWindUnit('knots');
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('INVALID_UNIT');
    });
  });

  describe('sanitizeString', () => {
    test('trims and normalizes whitespace', () => {
      const result = ValidationUtils.sanitizeString('  hello   world  ');
      expect(result).toBe('hello world');
    });

    test('removes harmful characters', () => {
      const result = ValidationUtils.sanitizeString(
        '<script>alert("xss")</script>'
      );
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain('"');
    });

    test('limits string length', () => {
      const longString = 'a'.repeat(200);
      const result = ValidationUtils.sanitizeString(longString, 50);
      expect(result.length).toBe(50);
    });

    test('handles non-string input', () => {
      const result = ValidationUtils.sanitizeString(123);
      expect(result).toBe('');

      const result2 = ValidationUtils.sanitizeString(null);
      expect(result2).toBe('');
    });
  });

  describe('validateBoolean', () => {
    test('accepts boolean values', () => {
      const result = ValidationUtils.validateBoolean(true);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(true);

      const result2 = ValidationUtils.validateBoolean(false);
      expect(result2.isValid).toBe(true);
      expect(result2.value).toBe(false);
    });

    test('converts string representations', () => {
      const trueValues = ['true', 'TRUE', '1', ' true '];
      trueValues.forEach((value) => {
        const result = ValidationUtils.validateBoolean(value);
        expect(result.isValid).toBe(true);
        expect(result.value).toBe(true);
      });

      const falseValues = ['false', 'FALSE', '0', ' false '];
      falseValues.forEach((value) => {
        const result = ValidationUtils.validateBoolean(value);
        expect(result.isValid).toBe(true);
        expect(result.value).toBe(false);
      });
    });

    test('converts numeric values', () => {
      const result = ValidationUtils.validateBoolean(1);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(true);

      const result2 = ValidationUtils.validateBoolean(0);
      expect(result2.isValid).toBe(true);
      expect(result2.value).toBe(false);
    });

    test('rejects invalid values', () => {
      const result = ValidationUtils.validateBoolean('invalid');
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('INVALID_BOOLEAN');
    });
  });

  describe('validateQueryParams', () => {
    test('validates all parameters correctly', () => {
      const searchParams = new URLSearchParams({
        history: '14',
        tempUnit: 'fahrenheit',
        pressureUnit: 'hpa',
        windUnit: 'mph',
        includeEstimated: 'true',
      });

      const result = ValidationUtils.validateQueryParams(searchParams);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.params.historyDays).toBe(14);
      expect(result.params.temperatureUnit).toBe('fahrenheit');
      expect(result.params.pressureUnit).toBe('hpa');
      expect(result.params.windUnit).toBe('mph');
      expect(result.params.includeEstimated).toBe(true);
    });

    test('uses default values when parameters are missing', () => {
      const searchParams = new URLSearchParams();
      const result = ValidationUtils.validateQueryParams(searchParams);

      expect(result.isValid).toBe(true);
      expect(result.params.historyDays).toBe(7);
      expect(result.params.temperatureUnit).toBe('celsius');
      expect(result.params.pressureUnit).toBe('pa');
      expect(result.params.windUnit).toBe('mps');
      expect(result.params.includeEstimated).toBe(false);
    });

    test('accumulates validation errors', () => {
      const searchParams = new URLSearchParams({
        history: '50', // Out of range
        tempUnit: 'kelvin', // Invalid unit
        windUnit: 'knots', // Invalid unit
      });

      const result = ValidationUtils.validateQueryParams(searchParams);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.includes('History days'))).toBe(true);
      expect(result.errors.some((e) => e.includes('temperature unit'))).toBe(
        true
      );
      expect(result.errors.some((e) => e.includes('wind unit'))).toBe(true);
    });
  });
});
