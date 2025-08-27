/**
 * NASA Mars Rover Photos API Proxy
 * Securely fetches and normalizes photo data from NASA APIs
 */

import { NextRequest, NextResponse } from 'next/server';
import { PhotosService } from '@/features/photos/photos-service';
import { RoverName } from '@/types/weather';
import { PhotosApiError, PhotosDataOptions, CameraName } from '@/types/photos';

/**
 * GET /api/photos/[rover]
 * Fetches latest photos for specified rover
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
      const error: PhotosApiError = {
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
    const options: PhotosDataOptions = {
      limit: Math.min(parseInt(searchParams.get('limit') ?? '12', 10), 50), // Max 50 photos
    };

    const solParam = searchParams.get('sol');
    if (solParam) {
      options.sol = parseInt(solParam, 10);
    }

    const earthDateParam = searchParams.get('earth_date');
    if (earthDateParam) {
      options.earthDate = earthDateParam;
    }

    const cameraParam = searchParams.get('camera');
    if (cameraParam) {
      options.camera = cameraParam as CameraName; // Camera validation happens in the service layer
    }

    const pageParam = searchParams.get('page');
    if (pageParam) {
      options.page = Math.max(parseInt(pageParam, 10), 1);
    }

    // Validate parameters
    if (options.sol !== undefined && (options.sol < 0 || options.sol > 10000)) {
      const error: PhotosApiError = {
        error: 'Invalid sol parameter',
        code: 'INVALID_SOL',
        details: {
          sol: options.sol,
          message: 'Sol must be between 0 and 10000',
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

    // Fetch photos data through service layer
    const photosData = await PhotosService.getLatestPhotos(
      rover as RoverName,
      options
    );

    // Set appropriate cache headers based on data freshness
    const cacheControl =
      photosData.data.status === 'success'
        ? 'public, s-maxage=1800, stale-while-revalidate=3600' // 30 min cache, 1 hour stale
        : 'public, s-maxage=300, stale-while-revalidate=600'; // 5 min cache for errors

    return NextResponse.json(photosData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': cacheControl,
        'X-Rover': rover,
        'X-Photo-Count': photosData.meta.count.toString(),
        'X-Last-Updated': photosData.data.lastFetch,
      },
    });
  } catch (error) {
    console.error('Photos API Error:', error);

    // Create structured error response
    const apiError: PhotosApiError = {
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
 * OPTIONS /api/photos/[rover]
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
