/**
 * Mars rover photo data types
 * Based on NASA Mars Rover Photos API
 */

/** Supported rover names */
export type RoverName = 'curiosity' | 'perseverance';

/** Camera types available on Mars rovers */
export type CameraName =
  | 'FHAZ' // Front Hazard Avoidance Camera
  | 'RHAZ' // Rear Hazard Avoidance Camera
  | 'MAST' // Mast Camera
  | 'CHEMCAM' // Chemistry and Camera Complex
  | 'MAHLI' // Mars Hand Lens Imager
  | 'MARDI' // Mars Descent Imager
  | 'NAVCAM' // Navigation Camera
  | 'NAVCAM_LEFT' // Navigation Camera - Left
  | 'NAVCAM_RIGHT' // Navigation Camera - Right
  | 'PANCAM' // Panoramic Camera
  | 'MINITES' // Miniature Thermal Emission Spectrometer
  | 'EDL_RUCAM' // Entry, Descent, and Landing - Rover Up-Look Camera
  | 'EDL_RDCAM' // Entry, Descent, and Landing - Rover Down-Look Camera
  | 'EDL_DDCAM' // Entry, Descent, and Landing - Descent Stage Down-Look Camera
  | 'EDL_PUCAM1' // Entry, Descent, and Landing - Parachute Up-Look Camera A
  | 'EDL_PUCAM2' // Entry, Descent, and Landing - Parachute Up-Look Camera B
  | 'SUPERCAM_RMI' // SuperCam Remote Micro-Imager
  | 'PIXL' // Planetary Instrument for X-ray Lithochemistry
  | 'MCZCAM' // Mast Camera Zoom
  | 'MCZCAM_LEFT' // Mast Camera Zoom - Left
  | 'MCZCAM_RIGHT'; // Mast Camera Zoom - Right

/** Camera information */
export interface CameraInfo {
  /** Camera ID */
  id: number;
  /** Short camera name */
  name: CameraName;
  /** Full descriptive name */
  fullName: string;
  /** Rover ID this camera belongs to */
  roverId: number;
}

/** Rover status information */
export type RoverStatus = 'active' | 'complete' | 'inactive';

/** Rover metadata */
export interface RoverInfo {
  /** Rover ID */
  id: number;
  /** Rover name */
  name: RoverName;
  /** Mission landing date */
  landingDate: string;
  /** Mission launch date */
  launchDate: string;
  /** Current mission status */
  status: RoverStatus;
  /** Latest sol number */
  maxSol: number;
  /** Latest Earth date */
  maxDate: string;
  /** Total photos taken */
  totalPhotos: number;
}

/** Single Mars rover photo */
export interface MarsPhoto {
  /** Unique photo ID */
  id: number;
  /** Mars sol when photo was taken */
  sol: number;
  /** Earth date when photo was taken */
  earthDate: string;
  /** Camera that took the photo */
  camera: CameraInfo;
  /** Image source URL */
  imgSrc: string;
  /** Rover that took the photo */
  rover: RoverInfo;
  /** Timestamp when photo data was last updated */
  lastUpdated?: string;
}

/** Collection of latest Mars rover photos */
export interface LatestPhotosData {
  /** Array of latest photos */
  photos: MarsPhoto[];
  /** Total number of photos available */
  totalPhotos: number;
  /** Rover information */
  rover: RoverName;
  /** Data freshness indicator */
  lastFetch: string;
  /** API status */
  status: 'success' | 'partial' | 'error';
}

/** Photos API response structure */
export interface PhotosApiResponse {
  /** Photos data */
  data: LatestPhotosData;
  /** Response metadata */
  meta: {
    /** Number of photos returned */
    count: number;
    /** API request timestamp */
    requestTime: string;
    /** Cache information */
    cached: boolean;
    /** Cache expiry time */
    cacheExpiry?: string;
  };
}

/** Photos API error response */
export interface PhotosApiError {
  /** Error message */
  error: string;
  /** Error code */
  code: string;
  /** Detailed error information */
  details?: Record<string, unknown>;
  /** Timestamp of error */
  timestamp: string;
}

/** Options for photos data fetching */
export interface PhotosDataOptions {
  /** Maximum number of photos to return */
  limit?: number;
  /** Specific sol to fetch photos from */
  sol?: number;
  /** Specific Earth date to fetch photos from */
  earthDate?: string;
  /** Filter by camera name */
  camera?: CameraName;
  /** Page number for pagination */
  page?: number;
}

/** Photo loading states */
export type PhotoLoadingState = 'loading' | 'loaded' | 'error' | 'idle';

/** Photo display metadata */
export interface PhotoDisplayData extends MarsPhoto {
  /** Loading state for this photo */
  loadingState: PhotoLoadingState;
  /** Optimized thumbnail URL */
  thumbnailSrc?: string;
  /** Alt text for accessibility */
  altText: string;
}
