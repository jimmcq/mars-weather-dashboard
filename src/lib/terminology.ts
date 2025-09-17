/**
 * Mars Terminology Dictionary
 * Plain English definitions for Mars mission terms and acronyms
 */

/** Terminology definition type */
export interface TermDefinition {
  /** The term or acronym */
  term: string;
  /** Plain English definition */
  definition: string;
  /** Category for organization */
  category: 'time' | 'weather' | 'mission' | 'location' | 'general';
}

/** Complete Mars terminology dictionary */
export const MARS_TERMINOLOGY: Record<string, TermDefinition> = {
  // Mars Time Terms
  'coordinated mars time': {
    term: 'Coordinated Mars Time',
    definition:
      'A universal time standard for Mars, similar to UTC on Earth. All Mars missions use this as a reference time.',
    category: 'time',
  },
  mtc: {
    term: 'MTC',
    definition:
      'Coordinated Mars Time - a universal time standard for Mars, similar to UTC on Earth.',
    category: 'time',
  },
  ltst: {
    term: 'LTST',
    definition:
      "Local True Solar Time - the actual local time at a specific location on Mars based on the sun's position.",
    category: 'time',
  },
  'local true solar time': {
    term: 'Local True Solar Time',
    definition:
      "The actual local time at a specific location on Mars based on the sun's position, like local solar time on Earth.",
    category: 'time',
  },
  sol: {
    term: 'Sol',
    definition:
      'A Mars day, which is about 24 hours and 37 minutes long. Each mission counts sols from their landing day.',
    category: 'time',
  },
  'mars sol date': {
    term: 'Mars Sol Date',
    definition:
      'A continuous count of Mars days since a reference date, used for precise timekeeping across all Mars missions.',
    category: 'time',
  },
  msd: {
    term: 'MSD',
    definition:
      'Mars Sol Date - a continuous count of Mars days since a reference date.',
    category: 'time',
  },
  utc: {
    term: 'UTC',
    definition:
      'Coordinated Universal Time - the primary time standard on Earth, used as a reference for all space missions.',
    category: 'time',
  },

  // Weather Instruments
  rems: {
    term: 'REMS',
    definition:
      "Rover Environmental Monitoring Station - Curiosity's weather station that measures temperature, pressure, humidity, and wind.",
    category: 'weather',
  },
  meda: {
    term: 'MEDA',
    definition:
      "Mars Environmental Dynamics Analyzer - Perseverance's advanced weather station that monitors atmospheric conditions.",
    category: 'weather',
  },

  // Weather Terms
  'atmospheric pressure': {
    term: 'Atmospheric Pressure',
    definition:
      "The weight of Mars' thin atmosphere pressing down. Mars has less than 1% of Earth's atmospheric pressure.",
    category: 'weather',
  },
  hpa: {
    term: 'hPa',
    definition:
      'Hectopascals - a unit for measuring atmospheric pressure. Mars typically has 6-12 hPa (Earth has about 1013 hPa).',
    category: 'weather',
  },
  pascals: {
    term: 'Pascals',
    definition:
      'The standard unit for measuring atmospheric pressure. 100 pascals equals 1 hectopascal.',
    category: 'weather',
  },

  // Mission Terms
  'data quality': {
    term: 'Data Quality',
    definition:
      'How complete and reliable the measurements are. "Complete" means all sensors worked, "partial" means some data is missing.',
    category: 'mission',
  },

  // Locations
  'gale crater': {
    term: 'Gale Crater',
    definition:
      "A large impact crater where Curiosity landed in 2012. It's about 96 miles wide and contains evidence of ancient water.",
    category: 'location',
  },
  'jezero crater': {
    term: 'Jezero Crater',
    definition:
      'An ancient river delta where Perseverance landed in 2021. Scientists believe it once held a large lake.',
    category: 'location',
  },

  // Mission Names
  curiosity: {
    term: 'Curiosity',
    definition:
      "NASA's nuclear-powered rover that landed in Gale Crater in 2012. It's about the size of a car and studies Mars geology.",
    category: 'mission',
  },
  perseverance: {
    term: 'Perseverance',
    definition:
      "NASA's latest rover that landed in Jezero Crater in 2021. It's searching for signs of ancient microbial life.",
    category: 'mission',
  },

  // General Terms
  rover: {
    term: 'Rover',
    definition:
      "A robotic vehicle designed to move around on Mars' surface and conduct scientific experiments.",
    category: 'mission',
  },
  instrument: {
    term: 'Instrument',
    definition:
      'Scientific equipment on the rover that takes measurements, like weather stations, cameras, or rock analyzers.',
    category: 'mission',
  },
};

/**
 * Get definition for a term (case-insensitive)
 * @param term - The term to look up
 * @returns The definition or null if not found
 */
export function getTermDefinition(term: string): TermDefinition | null {
  const normalizedTerm = term.toLowerCase().trim();
  return MARS_TERMINOLOGY[normalizedTerm] || null;
}

/**
 * Get all terms by category
 * @param category - The category to filter by
 * @returns Array of terms in that category
 */
export function getTermsByCategory(
  category: TermDefinition['category']
): TermDefinition[] {
  return Object.values(MARS_TERMINOLOGY).filter(
    (term) => term.category === category
  );
}

/**
 * Search for terms that match a query
 * @param query - Search query
 * @returns Array of matching terms
 */
export function searchTerms(query: string): TermDefinition[] {
  const normalizedQuery = query.toLowerCase().trim();

  // Return empty array for empty queries
  if (normalizedQuery.length === 0) {
    return [];
  }

  return Object.values(MARS_TERMINOLOGY).filter(
    (term) =>
      term.term.toLowerCase().includes(normalizedQuery) ||
      term.definition.toLowerCase().includes(normalizedQuery)
  );
}
