/**
 * Input validation utilities
 * Provides robust validation and sanitization functions
 */

import { RoverName } from '@/types/weather';

/**
 * Validation result interface
 */
export interface ValidationResult<T> {
  isValid: boolean;
  value?: T;
  error?: string;
  code?: string;
}

/**
 * Input validation utilities
 */
export const ValidationUtils = {
  /**
   * Validate rover name parameter
   * @param rover - Rover name to validate
   * @returns Validation result with typed rover name
   */
  validateRover(rover: unknown): ValidationResult<RoverName> {
    if (typeof rover !== 'string') {
      return {
        isValid: false,
        error: 'Rover must be a string',
        code: 'INVALID_TYPE',
      };
    }

    const validRovers: RoverName[] = ['curiosity', 'perseverance'];
    const normalizedRover = rover.toLowerCase().trim() as RoverName;

    if (!validRovers.includes(normalizedRover)) {
      return {
        isValid: false,
        error: `Invalid rover name. Must be one of: ${validRovers.join(', ')}`,
        code: 'INVALID_ROVER',
      };
    }

    return {
      isValid: true,
      value: normalizedRover,
    };
  },

  /**
   * Validate history days parameter
   * @param days - Number of days to validate
   * @returns Validation result with validated number
   */
  validateHistoryDays(days: unknown): ValidationResult<number> {
    let numDays: number;

    if (typeof days === 'string') {
      numDays = parseInt(days, 10);
    } else if (typeof days === 'number') {
      numDays = days;
    } else {
      return {
        isValid: false,
        error: 'History days must be a number',
        code: 'INVALID_TYPE',
      };
    }

    if (isNaN(numDays)) {
      return {
        isValid: false,
        error: 'History days must be a valid number',
        code: 'INVALID_NUMBER',
      };
    }

    if (numDays < 1 || numDays > 30) {
      return {
        isValid: false,
        error: 'History days must be between 1 and 30',
        code: 'OUT_OF_RANGE',
      };
    }

    return {
      isValid: true,
      value: numDays,
    };
  },

  /**
   * Validate temperature unit parameter
   * @param unit - Temperature unit to validate
   * @returns Validation result with validated unit
   */
  validateTemperatureUnit(
    unit: unknown
  ): ValidationResult<'celsius' | 'fahrenheit'> {
    if (typeof unit !== 'string') {
      return {
        isValid: false,
        error: 'Temperature unit must be a string',
        code: 'INVALID_TYPE',
      };
    }

    const validUnits = ['celsius', 'fahrenheit'] as const;
    const normalizedUnit = unit.toLowerCase().trim();

    if (!validUnits.includes(normalizedUnit as (typeof validUnits)[number])) {
      return {
        isValid: false,
        error: `Invalid temperature unit. Must be one of: ${validUnits.join(', ')}`,
        code: 'INVALID_UNIT',
      };
    }

    return {
      isValid: true,
      value: normalizedUnit as 'celsius' | 'fahrenheit',
    };
  },

  /**
   * Validate pressure unit parameter
   * @param unit - Pressure unit to validate
   * @returns Validation result with validated unit
   */
  validatePressureUnit(unit: unknown): ValidationResult<'pa' | 'hpa' | 'mbar'> {
    if (typeof unit !== 'string') {
      return {
        isValid: false,
        error: 'Pressure unit must be a string',
        code: 'INVALID_TYPE',
      };
    }

    const validUnits = ['pa', 'hpa', 'mbar'] as const;
    const normalizedUnit = unit.toLowerCase().trim();

    if (!validUnits.includes(normalizedUnit as (typeof validUnits)[number])) {
      return {
        isValid: false,
        error: `Invalid pressure unit. Must be one of: ${validUnits.join(', ')}`,
        code: 'INVALID_UNIT',
      };
    }

    return {
      isValid: true,
      value: normalizedUnit as 'pa' | 'hpa' | 'mbar',
    };
  },

  /**
   * Validate wind unit parameter
   * @param unit - Wind unit to validate
   * @returns Validation result with validated unit
   */
  validateWindUnit(unit: unknown): ValidationResult<'mps' | 'kph' | 'mph'> {
    if (typeof unit !== 'string') {
      return {
        isValid: false,
        error: 'Wind unit must be a string',
        code: 'INVALID_TYPE',
      };
    }

    const validUnits = ['mps', 'kph', 'mph'] as const;
    const normalizedUnit = unit.toLowerCase().trim();

    if (!validUnits.includes(normalizedUnit as (typeof validUnits)[number])) {
      return {
        isValid: false,
        error: `Invalid wind unit. Must be one of: ${validUnits.join(', ')}`,
        code: 'INVALID_UNIT',
      };
    }

    return {
      isValid: true,
      value: normalizedUnit as 'mps' | 'kph' | 'mph',
    };
  },

  /**
   * Sanitize string input
   * @param input - String to sanitize
   * @param maxLength - Maximum allowed length (default: 100)
   * @returns Sanitized string
   */
  sanitizeString(input: unknown, maxLength = 100): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>\"'&]/g, '') // Remove potentially harmful characters
      .replace(/\s+/g, ' '); // Normalize whitespace
  },

  /**
   * Validate boolean parameter
   * @param value - Value to validate as boolean
   * @returns Validation result with boolean value
   */
  validateBoolean(value: unknown): ValidationResult<boolean> {
    if (typeof value === 'boolean') {
      return { isValid: true, value };
    }

    if (typeof value === 'string') {
      const normalized = value.toLowerCase().trim();
      if (normalized === 'true' || normalized === '1') {
        return { isValid: true, value: true };
      }
      if (normalized === 'false' || normalized === '0') {
        return { isValid: true, value: false };
      }
    }

    if (typeof value === 'number') {
      return { isValid: true, value: Boolean(value) };
    }

    return {
      isValid: false,
      error: 'Value must be a boolean or convertible to boolean',
      code: 'INVALID_BOOLEAN',
    };
  },

  /**
   * Validate and sanitize query parameters
   * @param searchParams - URLSearchParams object
   * @returns Validated and sanitized parameters
   */
  validateQueryParams(searchParams: URLSearchParams) {
    const params: {
      historyDays: number;
      temperatureUnit: 'celsius' | 'fahrenheit';
      pressureUnit: 'pa' | 'hpa' | 'mbar';
      windUnit: 'mps' | 'kph' | 'mph';
      includeEstimated: boolean;
    } = {
      historyDays: 7,
      temperatureUnit: 'celsius',
      pressureUnit: 'pa',
      windUnit: 'mps',
      includeEstimated: false,
    };

    const errors: string[] = [];

    // Validate history days
    const historyParam = searchParams.get('history');
    if (historyParam) {
      const historyValidation = this.validateHistoryDays(historyParam);
      if (historyValidation.isValid && historyValidation.value) {
        params.historyDays = historyValidation.value;
      } else {
        errors.push(historyValidation.error || 'Invalid history parameter');
      }
    }

    // Validate temperature unit
    const tempUnitParam = searchParams.get('tempUnit');
    if (tempUnitParam) {
      const tempValidation = this.validateTemperatureUnit(tempUnitParam);
      if (tempValidation.isValid && tempValidation.value) {
        params.temperatureUnit = tempValidation.value;
      } else {
        errors.push(tempValidation.error || 'Invalid temperature unit');
      }
    }

    // Validate pressure unit
    const pressureUnitParam = searchParams.get('pressureUnit');
    if (pressureUnitParam) {
      const pressureValidation = this.validatePressureUnit(pressureUnitParam);
      if (pressureValidation.isValid && pressureValidation.value) {
        params.pressureUnit = pressureValidation.value;
      } else {
        errors.push(pressureValidation.error || 'Invalid pressure unit');
      }
    }

    // Validate wind unit
    const windUnitParam = searchParams.get('windUnit');
    if (windUnitParam) {
      const windValidation = this.validateWindUnit(windUnitParam);
      if (windValidation.isValid && windValidation.value) {
        params.windUnit = windValidation.value;
      } else {
        errors.push(windValidation.error || 'Invalid wind unit');
      }
    }

    // Validate includeEstimated
    const includeEstimatedParam = searchParams.get('includeEstimated');
    if (includeEstimatedParam) {
      const boolValidation = this.validateBoolean(includeEstimatedParam);
      if (boolValidation.isValid && boolValidation.value !== undefined) {
        params.includeEstimated = boolValidation.value;
      } else {
        errors.push(
          boolValidation.error || 'Invalid includeEstimated parameter'
        );
      }
    }

    return {
      params,
      errors,
      isValid: errors.length === 0,
    };
  },
} as const;
