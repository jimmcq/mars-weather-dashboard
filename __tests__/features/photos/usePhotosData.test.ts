/**
 * @jest-environment jsdom
 */

import { PhotosApiResponse } from '@/types/photos';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = jest.mocked(fetch);

const mockApiResponse: PhotosApiResponse = {
  data: {
    photos: [
      {
        id: 102693,
        sol: 1000,
        earthDate: '2015-05-30',
        camera: {
          id: 22,
          name: 'MAST',
          fullName: 'Mast Camera',
          roverId: 5,
        },
        imgSrc: 'https://example.com/photo1.jpg',
        rover: {
          id: 5,
          name: 'curiosity',
          landingDate: '2012-08-05',
          launchDate: '2011-11-26',
          status: 'active',
          maxSol: 1200,
          maxDate: '2024-01-15',
          totalPhotos: 500000,
        },
        lastUpdated: '2024-01-15T12:00:00Z',
      },
    ],
    totalPhotos: 1,
    rover: 'curiosity',
    lastFetch: '2024-01-15T12:00:00Z',
    status: 'success',
  },
  meta: {
    count: 1,
    requestTime: '2024-01-15T12:00:00Z',
    cached: false,
  },
};

// Test the fetch function directly
async function fetchPhotosData(
  rover: string,
  options: Record<string, unknown> = {}
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

describe('Photos data fetching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches photos data successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const result = await fetchPhotosData('curiosity');

    expect(result).toEqual(mockApiResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/photos/curiosity',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
        }),
      })
    );
  });

  it('handles API errors', async () => {
    const errorResponse = {
      error: 'Not Found',
      code: 'NOT_FOUND',
      timestamp: '2024-01-15T12:00:00Z',
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => errorResponse,
    } as Response);

    await expect(fetchPhotosData('curiosity')).rejects.toThrow('Not Found');
  });

  it('handles network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchPhotosData('curiosity')).rejects.toThrow('Network error');
  });

  it('includes query parameters in URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    await fetchPhotosData('curiosity', {
      limit: 10,
      camera: 'MAST',
      page: 2,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/photos/curiosity?limit=10&camera=MAST&page=2',
      expect.any(Object)
    );
  });

  it('handles empty query parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    await fetchPhotosData('curiosity', {});

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/photos/curiosity',
      expect.any(Object)
    );
  });

  it('includes sol parameter in query', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    await fetchPhotosData('curiosity', { sol: 1000, limit: 5 });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/photos/curiosity?limit=5&sol=1000',
      expect.any(Object)
    );
  });

  it('includes earth_date parameter in query', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    await fetchPhotosData('curiosity', { earthDate: '2024-01-15', limit: 5 });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/photos/curiosity?limit=5&earth_date=2024-01-15',
      expect.any(Object)
    );
  });

  it('includes camera parameter in query', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    await fetchPhotosData('curiosity', { camera: 'MAST', limit: 5 });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/photos/curiosity?limit=5&camera=MAST',
      expect.any(Object)
    );
  });
});
