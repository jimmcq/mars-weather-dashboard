/**
 * Tests for photos API route
 */

// Mock Next.js server environment
global.Request = class MockRequest {
  url: string;
  
  constructor(url: string) {
    this.url = url;
  }
  
  get nextUrl() {
    const url = new URL(this.url);
    return {
      searchParams: url.searchParams
    };
  }
} as any;

import { GET } from '@/app/api/photos/[rover]/route';

// Mock PhotosService
jest.mock('@/features/photos/photos-service', () => ({
  PhotosService: {
    getLatestPhotos: jest.fn(),
    transformForDisplay: jest.fn(),
  },
}));

import { PhotosService } from '@/features/photos/photos-service';

const mockPhotosService = PhotosService as jest.Mocked<typeof PhotosService>;

describe('/api/photos/[rover]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns photos data for valid rover', async () => {
      const mockPhotosData = {
        photos: [
          {
            id: 1,
            sol: 4000,
            camera: {
              id: 20,
              name: 'FHAZ',
              rover_id: 5,
              full_name: 'Front Hazard Avoidance Camera',
            },
            img_src: 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/rvr/imgs/2023/1234.jpg',
            earth_date: '2024-01-01',
            rover: {
              id: 5,
              name: 'curiosity',
              landing_date: '2012-08-05',
              launch_date: '2011-11-26',
              status: 'active',
              max_sol: 4000,
              max_date: '2024-01-01',
              total_photos: 500000,
              cameras: [],
            },
          },
        ],
        latest: {
          sol: 4000,
          earth_date: '2024-01-01',
          total_photos: 1,
        },
        rover: 'curiosity' as const,
        requestTime: '2024-01-01T00:00:00Z',
        cached: false,
      };

      mockPhotosService.getLatestPhotos.mockResolvedValue(mockPhotosData);

      const request = new global.Request('http://localhost:3000/api/photos/curiosity') as any;
      const params = { rover: 'curiosity' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockPhotosData);
      expect(mockPhotosService.getLatestPhotos).toHaveBeenCalledWith('curiosity', {});
    });

    it('handles query parameters correctly', async () => {
      const mockPhotosData = {
        photos: [],
        latest: {
          sol: 1000,
          earth_date: '2021-03-01',
          total_photos: 0,
        },
        rover: 'perseverance' as const,
        requestTime: '2021-03-01T00:00:00Z',
        cached: false,
      };

      mockPhotosService.getLatestPhotos.mockResolvedValue(mockPhotosData);

      const request = new global.Request(
        'http://localhost:3000/api/photos/perseverance?camera=NAVCAM&sol=1000&limit=20'
      );
      const params = { rover: 'perseverance' };

      const response = await GET(request, { params });

      expect(response.status).toBe(200);
      expect(mockPhotosService.getLatestPhotos).toHaveBeenCalledWith('perseverance', {
        camera: 'NAVCAM',
        sol: 1000,
        limit: 20,
      });
    });

    it('returns 400 for invalid rover', async () => {
      const request = new global.Request('http://localhost:3000/api/photos/invalid');
      const params = { rover: 'invalid' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid rover name');
      expect(mockPhotosService.getLatestPhotos).not.toHaveBeenCalled();
    });

    it('handles service errors gracefully', async () => {
      mockPhotosService.getLatestPhotos.mockRejectedValue(new Error('NASA API unavailable'));

      const request = new global.Request('http://localhost:3000/api/photos/curiosity') as any;
      const params = { rover: 'curiosity' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch photos');
      expect(data.details).toBe('NASA API unavailable');
    });

    it('handles rate limiting (429) errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.message = '429: Rate limit exceeded';
      mockPhotosService.getLatestPhotos.mockRejectedValue(rateLimitError);

      const request = new global.Request('http://localhost:3000/api/photos/curiosity') as any;
      const params = { rover: 'curiosity' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded');
      expect(data.retryAfter).toBeDefined();
    });

    it('returns transformed photos when display=true', async () => {
      const mockPhotosData = {
        photos: [
          {
            id: 1,
            sol: 4000,
            camera: {
              id: 20,
              name: 'FHAZ',
              rover_id: 5,
              full_name: 'Front Hazard Avoidance Camera',
            },
            img_src: 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/rvr/imgs/2023/1234.jpg',
            earth_date: '2024-01-01',
            rover: {
              id: 5,
              name: 'curiosity',
              landing_date: '2012-08-05',
              launch_date: '2011-11-26',
              status: 'active',
              max_sol: 4000,
              max_date: '2024-01-01',
              total_photos: 500000,
              cameras: [],
            },
          },
        ],
        latest: {
          sol: 4000,
          earth_date: '2024-01-01',
          total_photos: 1,
        },
        rover: 'curiosity' as const,
        requestTime: '2024-01-01T00:00:00Z',
        cached: false,
      };

      const mockTransformedPhoto = {
        id: 1,
        sol: 4000,
        imgSrc: 'https://mars.nasa.gov/msl-raw-images/proj/msl/redops/rvr/imgs/2023/1234.jpg',
        earthDate: '2024-01-01',
        camera: {
          name: 'FHAZ',
          fullName: 'Front Hazard Avoidance Camera',
        },
        rover: {
          name: 'curiosity',
        },
        altText: 'Mars photo from Front Hazard Avoidance Camera on Sol 4000',
      };

      mockPhotosService.getLatestPhotos.mockResolvedValue(mockPhotosData);
      mockPhotosService.transformForDisplay.mockReturnValue(mockTransformedPhoto);

      const request = new global.Request('http://localhost:3000/api/photos/curiosity?display=true');
      const params = { rover: 'curiosity' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.photos).toEqual([mockTransformedPhoto]);
      expect(mockPhotosService.transformForDisplay).toHaveBeenCalledWith(mockPhotosData.photos[0]);
    });
  });
});