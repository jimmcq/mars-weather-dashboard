/**
 * Custom hook for fetching available cameras for Mars rovers
 */

import { useQuery } from '@tanstack/react-query';
import { RoverName } from '@/types/weather';
import { PhotosService } from './photos-service';

/**
 * Hook to fetch available cameras for a specific rover
 * @param rover - Rover name to get cameras for
 * @returns Query result with camera data
 */
export function useCameraData(rover: RoverName): ReturnType<typeof useQuery> {
  return useQuery({
    queryKey: ['camera-data', rover],
    queryFn: async () => {
      const manifest = await PhotosService.getRoverManifest(rover);
      return manifest.cameras;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - camera data rarely changes
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    retry: 2,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
