/**
 * Tests for the terminology dictionary and lookup functions
 * Covers term definitions, search functionality, and categorization
 */

import {
  MARS_TERMINOLOGY,
  getTermDefinition,
  getTermsByCategory,
  searchTerms,
  TermDefinition,
} from '@/lib/terminology';

describe('Mars Terminology Dictionary', () => {
  describe('Dictionary Content', () => {
    test('contains expected Mars time terms', () => {
      const sol = MARS_TERMINOLOGY['sol'];
      expect(sol).toBeDefined();
      expect(sol?.definition).toContain('Mars day');
      expect(sol?.category).toBe('time');

      const cmt = MARS_TERMINOLOGY['coordinated mars time'];
      expect(cmt).toBeDefined();
      expect(cmt?.definition).toContain('universal time standard');

      const utc = MARS_TERMINOLOGY['utc'];
      expect(utc).toBeDefined();
      expect(utc?.definition).toContain('Coordinated Universal Time');
    });

    test('contains expected weather instrument terms', () => {
      const rems = MARS_TERMINOLOGY['rems'];
      expect(rems).toBeDefined();
      expect(rems?.definition).toContain(
        'Rover Environmental Monitoring Station'
      );
      expect(rems?.category).toBe('weather');

      const meda = MARS_TERMINOLOGY['meda'];
      expect(meda).toBeDefined();
      expect(meda?.definition).toContain(
        'Mars Environmental Dynamics Analyzer'
      );
      expect(meda?.category).toBe('weather');
    });

    test('contains expected mission terms', () => {
      const curiosity = MARS_TERMINOLOGY['curiosity'];
      expect(curiosity).toBeDefined();
      expect(curiosity?.category).toBe('mission');

      const perseverance = MARS_TERMINOLOGY['perseverance'];
      expect(perseverance).toBeDefined();
      expect(perseverance?.category).toBe('mission');
    });

    test('contains expected location terms', () => {
      const gale = MARS_TERMINOLOGY['gale crater'];
      expect(gale).toBeDefined();
      expect(gale?.category).toBe('location');

      const jezero = MARS_TERMINOLOGY['jezero crater'];
      expect(jezero).toBeDefined();
      expect(jezero?.category).toBe('location');
    });

    test('all terms have required properties', () => {
      Object.values(MARS_TERMINOLOGY).forEach((term: TermDefinition) => {
        expect(term.term).toBeDefined();
        expect(term.term.length).toBeGreaterThan(0);

        expect(term.definition).toBeDefined();
        expect(term.definition.length).toBeGreaterThan(0);

        expect(term.category).toBeDefined();
        expect(['time', 'weather', 'mission', 'location', 'general']).toContain(
          term.category
        );
      });
    });
  });

  describe('getTermDefinition', () => {
    test('finds exact matches', () => {
      const solDefinition = getTermDefinition('sol');
      expect(solDefinition).not.toBeNull();
      expect(solDefinition?.term).toBe('Sol');
      expect(solDefinition?.definition).toContain('Mars day');
    });

    test('handles case-insensitive lookup', () => {
      const upperCase = getTermDefinition('SOL');
      const lowerCase = getTermDefinition('sol');
      const mixedCase = getTermDefinition('Sol');

      expect(upperCase).toEqual(lowerCase);
      expect(lowerCase).toEqual(mixedCase);
      expect(upperCase?.term).toBe('Sol');
    });

    test('handles whitespace', () => {
      const withSpaces = getTermDefinition('  sol  ');
      const withoutSpaces = getTermDefinition('sol');

      expect(withSpaces).toEqual(withoutSpaces);
    });

    test('returns null for unknown terms', () => {
      const unknown = getTermDefinition('unknown-term-12345');
      expect(unknown).toBeNull();
    });

    test('handles empty string', () => {
      const empty = getTermDefinition('');
      expect(empty).toBeNull();
    });

    test('finds multi-word terms', () => {
      const coordinated = getTermDefinition('coordinated mars time');
      expect(coordinated).not.toBeNull();
      expect(coordinated?.definition).toContain('universal time standard');
    });

    test('finds acronyms', () => {
      const rems = getTermDefinition('REMS');
      expect(rems).not.toBeNull();
      expect(rems?.definition).toContain(
        'Rover Environmental Monitoring Station'
      );

      const meda = getTermDefinition('MEDA');
      expect(meda).not.toBeNull();
      expect(meda?.definition).toContain(
        'Mars Environmental Dynamics Analyzer'
      );

      const utc = getTermDefinition('UTC');
      expect(utc).not.toBeNull();
      expect(utc?.definition).toContain('Coordinated Universal Time');
    });
  });

  describe('getTermsByCategory', () => {
    test('returns all time-related terms', () => {
      const timeTerms = getTermsByCategory('time');
      expect(timeTerms.length).toBeGreaterThan(0);

      const termNames = timeTerms.map((t) => t.term.toLowerCase());
      expect(termNames).toContain('sol');
      expect(termNames).toContain('coordinated mars time');
      expect(termNames).toContain('utc');

      // All should be time category
      timeTerms.forEach((term) => {
        expect(term.category).toBe('time');
      });
    });

    test('returns all weather-related terms', () => {
      const weatherTerms = getTermsByCategory('weather');
      expect(weatherTerms.length).toBeGreaterThan(0);

      const termNames = weatherTerms.map((t) => t.term.toLowerCase());
      expect(termNames).toContain('rems');
      expect(termNames).toContain('meda');

      weatherTerms.forEach((term) => {
        expect(term.category).toBe('weather');
      });
    });

    test('returns all mission-related terms', () => {
      const missionTerms = getTermsByCategory('mission');
      expect(missionTerms.length).toBeGreaterThan(0);

      const termNames = missionTerms.map((t) => t.term.toLowerCase());
      expect(termNames).toContain('curiosity');
      expect(termNames).toContain('perseverance');

      missionTerms.forEach((term) => {
        expect(term.category).toBe('mission');
      });
    });

    test('returns all location-related terms', () => {
      const locationTerms = getTermsByCategory('location');
      expect(locationTerms.length).toBeGreaterThan(0);

      const termNames = locationTerms.map((t) => t.term.toLowerCase());
      expect(termNames).toContain('gale crater');
      expect(termNames).toContain('jezero crater');

      locationTerms.forEach((term) => {
        expect(term.category).toBe('location');
      });
    });

    test('returns empty array for non-existent category', () => {
      // TypeScript should prevent this, but test runtime behavior
      const invalidTerms = getTermsByCategory(
        'invalid' as TermDefinition['category']
      );
      expect(invalidTerms).toEqual([]);
    });
  });

  describe('searchTerms', () => {
    test('finds terms by exact term match', () => {
      const results = searchTerms('sol');
      expect(results.length).toBeGreaterThan(0);

      const solTerm = results.find((t) => t.term.toLowerCase() === 'sol');
      expect(solTerm).toBeDefined();
    });

    test('finds terms by partial term match', () => {
      const results = searchTerms('mars');
      expect(results.length).toBeGreaterThan(0);

      // Should include "Coordinated Mars Time" and "Mars Sol Date"
      const marsTimeTerms = results.filter((t) =>
        t.term.toLowerCase().includes('mars')
      );
      expect(marsTimeTerms.length).toBeGreaterThan(0);
    });

    test('finds terms by definition content', () => {
      const results = searchTerms('rover');
      expect(results.length).toBeGreaterThan(0);

      // Should include terms that mention "rover" in their definition
      const roverTerms = results.filter((t) =>
        t.definition.toLowerCase().includes('rover')
      );
      expect(roverTerms.length).toBeGreaterThan(0);
    });

    test('handles case-insensitive search', () => {
      const upperResults = searchTerms('MARS');
      const lowerResults = searchTerms('mars');
      const mixedResults = searchTerms('Mars');

      expect(upperResults).toEqual(lowerResults);
      expect(lowerResults).toEqual(mixedResults);
    });

    test('handles whitespace in search query', () => {
      const withSpaces = searchTerms('  mars  ');
      const withoutSpaces = searchTerms('mars');

      expect(withSpaces).toEqual(withoutSpaces);
    });

    test('returns empty array for no matches', () => {
      const results = searchTerms('nonexistent-term-xyz');
      expect(results).toEqual([]);
    });

    test('returns empty array for empty query', () => {
      const results = searchTerms('');
      expect(results.length).toBe(0);
    });

    test('finds multiple related terms', () => {
      const timeResults = searchTerms('time');
      expect(timeResults.length).toBeGreaterThan(1);

      // Should include various time-related terms
      const termNames = timeResults.map((t) => t.term.toLowerCase());
      expect(termNames.some((name) => name.includes('mars'))).toBe(true);
      expect(termNames.some((name) => name.includes('utc'))).toBe(true);
    });
  });

  describe('Definition Quality', () => {
    test('definitions are informative and user-friendly', () => {
      Object.values(MARS_TERMINOLOGY).forEach((term: TermDefinition) => {
        // Should be substantial (not just a few words)
        expect(term.definition.length).toBeGreaterThan(20);

        // Should be readable (no excessive technical jargon without explanation)
        expect(term.definition).not.toMatch(/^\w+$/); // Not just one word

        // Should start with capital letter and have proper punctuation
        expect(term.definition[0]).toMatch(/[A-Z]/);
      });
    });

    test('acronym definitions explain what the acronym stands for', () => {
      const acronyms = ['rems', 'meda', 'utc', 'mtc', 'ltst', 'msd'];

      acronyms.forEach((acronym) => {
        const definition = getTermDefinition(acronym);
        expect(definition).not.toBeNull();

        // Should explain what the acronym stands for
        expect(definition!.definition).toMatch(/[A-Z][a-z]+ [A-Z]/); // Has expanded form
      });
    });
  });
});
