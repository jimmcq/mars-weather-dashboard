/**
 * React hook for Mars rover photos data management
 * Provides photos fetching with TanStack Query integration
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  PhotosApiResponse,
  PhotosDataOptions,
  CameraName,
} from '@/types/photos';
import { RoverName } from '@/types/weather';

/**
 * Fetches photos data from our API proxy
 */
async function fetchPhotosData(
  rover: RoverName,
  options: PhotosDataOptions = {}
): Promise<PhotosApiResponse> {
  const params = new URLSearchParams();

  if (options.limit) params.append('limit', options.limit.toString());
  if (options.sol !== undefined) params.append('sol', options.sol.toString());
  if (options.earthDate) params.append('earth_date', options.earthDate);
  if (options.camera) params.append('camera', options.camera);
  if (options.page) params.append('page', options.page.toString());

  const url = `/api/photos/${rover}${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        `Failed to fetch photos: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Hook for fetching latest rover photos
 */
export function usePhotosData(
  rover: RoverName,
  options: PhotosDataOptions = {}
): UseQueryResult<PhotosApiResponse, Error> {
  return useQuery({
    queryKey: ['photos', rover, options],
    queryFn: () => fetchPhotosData(rover, options),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
  });
}

/**
 * Hook for fetching photos by specific sol
 */
export function usePhotosBySol(
  rover: RoverName,
  sol: number,
  options: Omit<PhotosDataOptions, 'sol'> = {}
): UseQueryResult<PhotosApiResponse, Error> {
  return usePhotosData(rover, { ...options, sol });
}

/**
 * Hook for fetching photos by Earth date
 */
export function usePhotosByDate(
  rover: RoverName,
  earthDate: string,
  options: Omit<PhotosDataOptions, 'earthDate'> = {}
): UseQueryResult<PhotosApiResponse, Error> {
  return usePhotosData(rover, { ...options, earthDate });
}

/**
 * Hook for fetching photos by camera
 */
export function usePhotosByCamera(
  rover: RoverName,
  camera: CameraName,
  options: Omit<PhotosDataOptions, 'camera'> = {}
): UseQueryResult<PhotosApiResponse, Error> {
  return usePhotosData(rover, { ...options, camera });
}
