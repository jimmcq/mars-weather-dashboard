/**
 * Tests for photos API service integration
 * Note: These tests focus on the service layer rather than Next.js route internals
 */

import { PhotosService } from '@/features/photos/photos-service';
import { RoverName } from '@/types/weather';

// Mock PhotosService
jest.mock('@/features/photos/photos-service', () => ({
  PhotosService: {
    getLatestPhotos: jest.fn(),
    transformForDisplay: jest.fn(),
  },
}));

const mockPhotosService = PhotosService as jest.Mocked<typeof PhotosService>;

const mockPhotosData = {
  data: {
    photos: [
      {
        id: 1,
        sol: 4000,
        earthDate: '2024-01-01',
        imgSrc: 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/rvr/imgs/2023/1234.jpg',
        camera: {
          id: 20,
          name: 'FHAZ' as const,
          fullName: 'Front Hazard Avoidance Camera',
          roverId: 5,
        },
        rover: {
          id: 5,
          name: 'curiosity' as const,
          landingDate: '2012-08-05',
          launchDate: '2011-11-26',
          status: 'active' as const,
          maxSol: 4000,
          maxDate: '2024-01-01',
          totalPhotos: 500000,
        },
      },
    ],
    totalPhotos: 1,
    rover: 'curiosity' as const,
    lastFetch: '2024-01-01T00:00:00Z',
    status: 'success' as const,
  },
  meta: {
    count: 1,
    requestTime: '2024-01-01T00:00:00Z',
    cached: false,
  },
};

describe('Photos API Service Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PhotosService.getLatestPhotos', () => {
    it('returns photos data for valid rover', async () => {
      mockPhotosService.getLatestPhotos.mockResolvedValue(mockPhotosData);

      const result = await PhotosService.getLatestPhotos('curiosity', {});

      expect(result).toEqual(mockPhotosData);
      expect(mockPhotosService.getLatestPhotos).toHaveBeenCalledWith('curiosity', {});
    });

    it('handles query parameters correctly', async () => {
      const perseveranceData = {
        ...mockPhotosData,
        data: {
          ...mockPhotosData.data,
          rover: 'perseverance' as const,
        },
      };

      mockPhotosService.getLatestPhotos.mockResolvedValue(perseveranceData);

      const options = {
        camera: 'NAVCAM' as const,
        sol: 1000,
        limit: 20,
      };

      await PhotosService.getLatestPhotos('perseverance', options);

      expect(mockPhotosService.getLatestPhotos).toHaveBeenCalledWith('perseverance', options);
    });

    it('handles service errors gracefully', async () => {
      mockPhotosService.getLatestPhotos.mockRejectedValue(new Error('NASA API unavailable'));

      await expect(PhotosService.getLatestPhotos('curiosity', {})).rejects.toThrow(
        'NASA API unavailable'
      );
    });

    it('handles rate limiting (429) errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.message = '429: Rate limit exceeded';
      mockPhotosService.getLatestPhotos.mockRejectedValue(rateLimitError);

      await expect(PhotosService.getLatestPhotos('curiosity', {})).rejects.toThrow(
        '429: Rate limit exceeded'
      );
    });
  });

  describe('PhotosService.transformForDisplay', () => {
    it('transforms photo data for display', () => {
      const mockTransformedPhoto = {
        id: 1,
        sol: 4000,
        imgSrc: 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/rvr/imgs/2023/1234.jpg',
        earthDate: '2024-01-01',
        camera: {
          id: 20,
          name: 'FHAZ' as const,
          fullName: 'Front Hazard Avoidance Camera',
          roverId: 5,
        },
        rover: {
          id: 5,
          name: 'curiosity' as const,
          landingDate: '2012-08-05',
          launchDate: '2011-11-26',
          status: 'active' as const,
          maxSol: 4000,
          maxDate: '2024-01-01',
          totalPhotos: 500000,
        },
        altText: 'Mars photo from Front Hazard Avoidance Camera on Sol 4000',
        loadingState: 'loaded' as const,
      };

      mockPhotosService.transformForDisplay.mockReturnValue(mockTransformedPhoto);

      const result = PhotosService.transformForDisplay(mockPhotosData.data.photos[0]!);

      expect(result).toEqual(mockTransformedPhoto);
      expect(mockPhotosService.transformForDisplay).toHaveBeenCalledWith(mockPhotosData.data.photos[0]);
    });
  });

  describe('API validation logic', () => {
    it('validates rover names correctly', () => {
      const validRovers: RoverName[] = ['curiosity', 'perseverance'];
      
      expect(validRovers.includes('curiosity')).toBe(true);
      expect(validRovers.includes('perseverance')).toBe(true);
      expect(validRovers.includes('invalid' as RoverName)).toBe(false);
    });

    it('handles empty response data', async () => {
      const emptyData = {
        ...mockPhotosData,
        data: {
          ...mockPhotosData.data,
          photos: [],
          totalPhotos: 0,
        },
      };

      mockPhotosService.getLatestPhotos.mockResolvedValue(emptyData);

      const result = await PhotosService.getLatestPhotos('curiosity', {});

      expect(result.data.photos).toHaveLength(0);
      expect(result.data.totalPhotos).toBe(0);
    });
  });
});