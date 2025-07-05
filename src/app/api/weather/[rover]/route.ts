/**
 * NASA Mars Weather API Proxy
 * Securely fetches and normalizes weather data from NASA APIs
 */

import { NextRequest, NextResponse } from 'next/server';
import { WeatherService } from '@/features/weather/weather-service';
import { RoverName, WeatherApiError } from '@/types/weather';

/**
 * GET /api/weather/[rover]
 * Fetches latest weather data for specified rover
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ rover: string }> }
): Promise<NextResponse> {
  try {
    const { rover } = await params;
    const { searchParams } = new URL(request.url);

    // Validate rover name
    const validRovers: RoverName[] = ['curiosity', 'perseverance'];
    if (!validRovers.includes(rover as RoverName)) {
      const error: WeatherApiError = {
        error: 'Invalid rover name',
        code: 'INVALID_ROVER',
        details: {
          rover,
          validRovers,
          message: 'Rover must be one of: curiosity, perseverance',
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(error, {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Parse optional query parameters
    const options = {
      historyDays: parseInt(searchParams.get('history') ?? '7', 10),
      temperatureUnit:
        (searchParams.get('tempUnit') as 'celsius' | 'fahrenheit') ?? 'celsius',
      pressureUnit:
        (searchParams.get('pressureUnit') as 'pa' | 'hpa' | 'mbar') ?? 'pa',
      windUnit:
        (searchParams.get('windUnit') as 'mps' | 'kph' | 'mph') ?? 'mps',
      includeEstimated: searchParams.get('includeEstimated') === 'true',
    };

    // Validate history days parameter
    if (options.historyDays < 1 || options.historyDays > 30) {
      const error: WeatherApiError = {
        error: 'Invalid history parameter',
        code: 'INVALID_HISTORY',
        details: {
          historyDays: options.historyDays,
          message: 'History days must be between 1 and 30',
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(error, {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Fetch weather data through service layer
    const weatherData = await WeatherService.getWeatherData(
      rover as RoverName,
      options
    );

    // Set appropriate cache headers based on data freshness
    const cacheControl =
      weatherData.data.status === 'success'
        ? 'public, s-maxage=300, stale-while-revalidate=600' // 5 min cache, 10 min stale
        : 'public, s-maxage=60, stale-while-revalidate=300'; // 1 min cache for errors

    return NextResponse.json(weatherData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': cacheControl,
        'X-Rover': rover,
        'X-Data-Quality': weatherData.data.latest.dataQuality,
        'X-Last-Updated': weatherData.data.lastFetch,
      },
    });
  } catch (error) {
    console.error('Weather API Error:', error);

    // Create structured error response
    const apiError: WeatherApiError = {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      details: {
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        rover: 'unknown',
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(apiError, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  }
}

/**
 * OPTIONS /api/weather/[rover]
 * CORS preflight response
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Generate static params for supported rovers
 * Enables static generation of API routes
 */
export function generateStaticParams(): Array<{ rover: string }> {
  return [{ rover: 'curiosity' }, { rover: 'perseverance' }];
}
