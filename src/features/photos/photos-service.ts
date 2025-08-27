/**
 * Mars rover photos service layer
 * Handles NASA Mars Rover Photos API integration and data transformation
 */

import {
  LatestPhotosData,
  MarsPhoto,
  PhotosApiResponse,
  PhotosDataOptions,
  CameraInfo,
  RoverInfo,
  PhotoDisplayData,
  CameraName,
} from '@/types/photos';
import { RoverName } from '@/types/weather';

// NASA API Configuration
const NASA_API_BASE = 'https://api.nasa.gov/mars-photos/api/v1';
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

/**
 * Raw NASA Photo API response structure
 */
interface NASARawPhoto {
  id: number;
  sol: number;
  camera: {
    id: number;
    name: string;
    rover_id: number;
    full_name: string;
  };
  img_src: string;
  earth_date: string;
  rover: {
    id: number;
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
    max_sol: number;
    max_date: string;
    total_photos: number;
  };
}

interface NASAPhotosResponse {
  latest_photos?: NASARawPhoto[];
  photos?: NASARawPhoto[];
}

export class PhotosService {
  /**
   * Fetches latest photos for a specific rover
   */
  static async getLatestPhotos(
    rover: RoverName,
    options: PhotosDataOptions = {}
  ): Promise<PhotosApiResponse> {
    const cached = false;

    try {
      // Build NASA API URL
      const params = new URLSearchParams({
        api_key: NASA_API_KEY,
      });

      // Add optional parameters
      if (options.sol !== undefined) {
        params.append('sol', options.sol.toString());
      }
      if (options.earthDate) {
        params.append('earth_date', options.earthDate);
      }
      if (options.camera) {
        params.append('camera', options.camera);
      }
      if (options.page && options.page > 1) {
        params.append('page', options.page.toString());
      }

      // Determine endpoint based on parameters
      const endpoint =
        options.sol !== undefined || options.earthDate
          ? `rovers/${rover}/photos`
          : `rovers/${rover}/latest_photos`;

      const url = `${NASA_API_BASE}/${endpoint}?${params.toString()}`;

      // Make API request with timeout and retries
      const response = await this.fetchWithRetry(url, {
        timeout: 15000, // 15 second timeout
        retries: 2,
      });

      if (!response.ok) {
        throw new Error(
          `NASA API responded with ${response.status}: ${response.statusText}`
        );
      }

      const rawData: NASAPhotosResponse = await response.json();
      const photos = rawData.latest_photos || rawData.photos || [];

      // Apply limit if specified
      const limitedPhotos = options.limit
        ? photos.slice(0, options.limit)
        : photos;

      // Transform raw data to our normalized format
      const normalizedData: LatestPhotosData = {
        photos: limitedPhotos.map(this.transformPhoto),
        totalPhotos: limitedPhotos.length,
        rover,
        lastFetch: new Date().toISOString(),
        status: 'success',
      };

      return {
        data: normalizedData,
        meta: {
          count: limitedPhotos.length,
          requestTime: new Date().toISOString(),
          cached,
          cacheExpiry: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        },
      };
    } catch (error) {
      console.error(`Error fetching photos for ${rover}:`, error);

      // Return error response with fallback empty data
      const errorData: LatestPhotosData = {
        photos: [],
        totalPhotos: 0,
        rover,
        lastFetch: new Date().toISOString(),
        status: 'error',
      };

      return {
        data: errorData,
        meta: {
          count: 0,
          requestTime: new Date().toISOString(),
          cached: false,
        },
      };
    }
  }

  /**
   * Transforms raw NASA photo data to our normalized format
   */
  private static transformPhoto(rawPhoto: NASARawPhoto): MarsPhoto {
    const camera: CameraInfo = {
      id: rawPhoto.camera.id,
      name: rawPhoto.camera.name as CameraName,
      fullName: rawPhoto.camera.full_name,
      roverId: rawPhoto.camera.rover_id,
    };

    const rover: RoverInfo = {
      id: rawPhoto.rover.id,
      name: rawPhoto.rover.name.toLowerCase() as RoverName,
      landingDate: rawPhoto.rover.landing_date,
      launchDate: rawPhoto.rover.launch_date,
      status: rawPhoto.rover.status as 'active' | 'complete' | 'inactive',
      maxSol: rawPhoto.rover.max_sol,
      maxDate: rawPhoto.rover.max_date,
      totalPhotos: rawPhoto.rover.total_photos,
    };

    return {
      id: rawPhoto.id,
      sol: rawPhoto.sol,
      earthDate: rawPhoto.earth_date,
      camera,
      imgSrc: rawPhoto.img_src,
      rover,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Transforms photo for display with additional metadata
   */
  static transformForDisplay(photo: MarsPhoto): PhotoDisplayData {
    // Generate descriptive alt text
    const altText = `Photo from ${photo.rover.name} rover taken on Sol ${photo.sol} (${photo.earthDate}) using ${photo.camera.fullName}`;

    // Generate thumbnail URL (if needed, for now use original)
    const thumbnailSrc = photo.imgSrc;

    return {
      ...photo,
      loadingState: 'idle',
      thumbnailSrc,
      altText,
    };
  }

  /**
   * Fetch with retry logic and timeout
   */
  private static async fetchWithRetry(
    url: string,
    options: { timeout: number; retries: number }
  ): Promise<Response> {
    const { timeout, retries } = options;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mars Weather Dashboard/1.0',
            Accept: 'application/json',
          },
        });

        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Get photos by specific criteria
   */
  static async getPhotosBySol(
    rover: RoverName,
    sol: number,
    options: Omit<PhotosDataOptions, 'sol'> = {}
  ): Promise<PhotosApiResponse> {
    return this.getLatestPhotos(rover, { ...options, sol });
  }

  /**
   * Get photos by Earth date
   */
  static async getPhotosByDate(
    rover: RoverName,
    earthDate: string,
    options: Omit<PhotosDataOptions, 'earthDate'> = {}
  ): Promise<PhotosApiResponse> {
    return this.getLatestPhotos(rover, { ...options, earthDate });
  }
}
