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

/**
 * NASA Mission Manifest response structure
 */
interface NASAManifestResponse {
  photo_manifest: {
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
    max_sol: number;
    max_date: string;
    total_photos: number;
    photos: Array<{
      sol: number;
      earth_date: string;
      total_photos: number;
      cameras: string[];
    }>;
  };
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

  /**
   * Get mission manifest for a rover
   * Returns all available cameras and mission details
   */
  static async getRoverManifest(rover: RoverName): Promise<{
    cameras: CameraInfo[];
    maxSol: number;
    status: string;
  }> {
    try {
      const params = new URLSearchParams({
        api_key: NASA_API_KEY,
      });

      const url = `${NASA_API_BASE}/manifests/${rover}?${params.toString()}`;

      const response = await this.fetchWithRetry(url, {
        timeout: 15000,
        retries: 0, // Don't retry manifest requests to avoid more rate limiting
      });

      if (!response.ok) {
        // For rate limiting (429) or other API issues, fall back to predefined cameras
        if (response.status === 429) {
          console.warn(
            `NASA API rate limited (429). Using fallback cameras for ${rover}`
          );
          return {
            cameras: this.getFallbackCameras(rover),
            maxSol: 0,
            status: 'active',
          };
        }

        throw new Error(
          `NASA Manifest API responded with ${response.status}: ${response.statusText}`
        );
      }

      const data: NASAManifestResponse = await response.json();
      const manifest = data.photo_manifest;

      // Extract unique cameras from all sols
      const allCameraNames = new Set<string>();
      manifest.photos.forEach((photoGroup) => {
        photoGroup.cameras.forEach((camera) => allCameraNames.add(camera));
      });

      // Convert to CameraInfo objects with mock data for cameras not in types
      const cameras: CameraInfo[] = Array.from(allCameraNames).map(
        (cameraName, index) => ({
          id: index + 1,
          name: cameraName as CameraName,
          fullName: this.getCameraFullName(cameraName as CameraName),
          roverId: rover === 'curiosity' ? 5 : 8, // Approximated rover IDs
        })
      );

      return {
        cameras,
        maxSol: manifest.max_sol,
        status: manifest.status,
      };
    } catch (error) {
      // Check if it's a rate limiting error
      if (error instanceof Error && error.message.includes('429')) {
        console.warn(
          `NASA API rate limited for ${rover}. Using fallback cameras.`
        );
      } else {
        console.error(`Error fetching manifest for ${rover}:`, error);
      }

      // Return fallback cameras if API fails
      return {
        cameras: this.getFallbackCameras(rover),
        maxSol: 0,
        status: 'active', // Assume active when using fallbacks
      };
    }
  }

  /**
   * Get camera full name from camera abbreviation
   */
  private static getCameraFullName(cameraName: CameraName): string {
    const cameraNames: Record<string, string> = {
      FHAZ: 'Front Hazard Avoidance Camera',
      RHAZ: 'Rear Hazard Avoidance Camera',
      MAST: 'Mast Camera',
      CHEMCAM_RMI: 'ChemCam Remote Micro-Imager',
      MAHLI: 'Mars Hand Lens Imager',
      MARDI: 'Mars Descent Imager',
      NAVCAM: 'Navigation Camera',
      NAVCAM_LEFT: 'Navigation Camera - Left',
      NAVCAM_RIGHT: 'Navigation Camera - Right',
      PANCAM: 'Panoramic Camera',
      MINITES: 'Miniature Thermal Emission Spectrometer',
      EDL_RUCAM: 'Entry, Descent, and Landing - Rover Up-Look Camera',
      EDL_RDCAM: 'Entry, Descent, and Landing - Rover Down-Look Camera',
      EDL_DDCAM: 'Entry, Descent, and Landing - Descent Stage Down-Look Camera',
      EDL_PUCAM1: 'Entry, Descent, and Landing - Parachute Up-Look Camera A',
      EDL_PUCAM2: 'Entry, Descent, and Landing - Parachute Up-Look Camera B',
      SUPERCAM_RMI: 'SuperCam Remote Micro-Imager',
      PIXL: 'Planetary Instrument for X-ray Lithochemistry',
      MCZCAM: 'Mast Camera Zoom',
      MCZCAM_LEFT: 'Mast Camera Zoom - Left',
      MCZCAM_RIGHT: 'Mast Camera Zoom - Right',
    };

    return (
      cameraNames[cameraName] ||
      cameraName.charAt(0).toUpperCase() + cameraName.slice(1).toLowerCase()
    );
  }

  /**
   * Get fallback cameras for rover if API fails
   */
  private static getFallbackCameras(rover: RoverName): CameraInfo[] {
    const curiosityCameras: CameraInfo[] = [
      {
        id: 1,
        name: 'FHAZ' as CameraName,
        fullName: 'Front Hazard Avoidance Camera',
        roverId: 5,
      },
      {
        id: 2,
        name: 'RHAZ' as CameraName,
        fullName: 'Rear Hazard Avoidance Camera',
        roverId: 5,
      },
      {
        id: 3,
        name: 'MAST' as CameraName,
        fullName: 'Mast Camera',
        roverId: 5,
      },
      {
        id: 4,
        name: 'CHEMCAM_RMI' as CameraName,
        fullName: 'ChemCam Remote Micro-Imager',
        roverId: 5,
      },
      {
        id: 5,
        name: 'MAHLI' as CameraName,
        fullName: 'Mars Hand Lens Imager',
        roverId: 5,
      },
      {
        id: 6,
        name: 'MARDI' as CameraName,
        fullName: 'Mars Descent Imager',
        roverId: 5,
      },
      {
        id: 7,
        name: 'NAVCAM' as CameraName,
        fullName: 'Navigation Camera',
        roverId: 5,
      },
    ];

    const perseveranceCameras: CameraInfo[] = [
      {
        id: 1,
        name: 'FHAZ' as CameraName,
        fullName: 'Front Hazard Avoidance Camera',
        roverId: 8,
      },
      {
        id: 2,
        name: 'RHAZ' as CameraName,
        fullName: 'Rear Hazard Avoidance Camera',
        roverId: 8,
      },
      {
        id: 3,
        name: 'NAVCAM_LEFT' as CameraName,
        fullName: 'Navigation Camera - Left',
        roverId: 8,
      },
      {
        id: 4,
        name: 'NAVCAM_RIGHT' as CameraName,
        fullName: 'Navigation Camera - Right',
        roverId: 8,
      },
      {
        id: 5,
        name: 'MCZCAM' as CameraName,
        fullName: 'Mast Camera Zoom',
        roverId: 8,
      },
      {
        id: 6,
        name: 'MCZCAM_LEFT' as CameraName,
        fullName: 'Mast Camera Zoom - Left',
        roverId: 8,
      },
      {
        id: 7,
        name: 'MCZCAM_RIGHT' as CameraName,
        fullName: 'Mast Camera Zoom - Right',
        roverId: 8,
      },
      {
        id: 8,
        name: 'SUPERCAM_RMI' as CameraName,
        fullName: 'SuperCam Remote Micro-Imager',
        roverId: 8,
      },
      {
        id: 9,
        name: 'PIXL' as CameraName,
        fullName: 'Planetary Instrument for X-ray Lithochemistry',
        roverId: 8,
      },
    ];

    return rover === 'curiosity' ? curiosityCameras : perseveranceCameras;
  }
}
