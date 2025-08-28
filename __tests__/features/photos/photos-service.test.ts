/**
 * @jest-environment jsdom
 */

import { PhotosService } from '@/features/photos/photos-service';
import { RoverName } from '@/types/weather';

// Mock the global fetch function
global.fetch = jest.fn();
const mockFetch = jest.mocked(fetch);

// Mock environment variables
const originalEnv = process.env;

describe('PhotosService', () => {
  // Mock console.error to suppress expected error logs during error testing
  const originalConsoleError = console.error;

  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, NASA_API_KEY: 'test-api-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const mockNASAResponse = {
    latest_photos: [
      {
        id: 102693,
        sol: 1000,
        camera: {
          id: 22,
          name: 'MAST',
          rover_id: 5,
          full_name: 'Mast Camera',
        },
        img_src: 'https://example.com/photo1.jpg',
        earth_date: '2015-05-30',
        rover: {
          id: 5,
          name: 'Curiosity',
          landing_date: '2012-08-05',
          launch_date: '2011-11-26',
          status: 'active',
          max_sol: 1200,
          max_date: '2024-01-15',
          total_photos: 500000,
        },
      },
      {
        id: 102694,
        sol: 1001,
        camera: {
          id: 23,
          name: 'NAVCAM',
          rover_id: 5,
          full_name: 'Navigation Camera',
        },
        img_src: 'https://example.com/photo2.jpg',
        earth_date: '2015-05-31',
        rover: {
          id: 5,
          name: 'Curiosity',
          landing_date: '2012-08-05',
          launch_date: '2011-11-26',
          status: 'active',
          max_sol: 1200,
          max_date: '2024-01-15',
          total_photos: 500000,
        },
      },
    ],
  };

  it('fetches latest photos successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockNASAResponse,
    } as Response);

    const result = await PhotosService.getLatestPhotos('curiosity');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('rovers/curiosity/latest_photos'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': 'Mars Weather Dashboard/1.0',
          Accept: 'application/json',
        }),
      })
    );

    expect(result.data.photos).toHaveLength(2);
    expect(result.data.rover).toBe('curiosity');
    expect(result.data.status).toBe('success');
    expect(result.meta.count).toBe(2);
  });

  it('transforms NASA photo data correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockNASAResponse,
    } as Response);

    const result = await PhotosService.getLatestPhotos('curiosity');
    const photo = result.data.photos[0];

    expect(photo).toBeDefined();
    if (photo) {
      expect(photo.id).toBe(102693);
      expect(photo.sol).toBe(1000);
      expect(photo.earthDate).toBe('2015-05-30');
      expect(photo.camera.name).toBe('MAST');
      expect(photo.camera.fullName).toBe('Mast Camera');
      expect(photo.rover.name).toBe('curiosity');
      expect(photo.rover.status).toBe('active');
      expect(photo.imgSrc).toBe('https://example.com/photo1.jpg');
    }
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    const result = await PhotosService.getLatestPhotos('curiosity');

    expect(result.data.photos).toHaveLength(0);
    expect(result.data.status).toBe('error');
    expect(result.meta.count).toBe(0);
  });

  it('handles network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await PhotosService.getLatestPhotos('curiosity');

    expect(result.data.photos).toHaveLength(0);
    expect(result.data.status).toBe('error');
    expect(result.meta.count).toBe(0);
  });

  it('uses correct endpoint for sol-based queries', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ photos: [] }),
    } as Response);

    await PhotosService.getLatestPhotos('curiosity', { sol: 1000 });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('rovers/curiosity/photos'),
      expect.any(Object)
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('sol=1000'),
      expect.any(Object)
    );
  });

  it('uses correct endpoint for earth date queries', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ photos: [] }),
    } as Response);

    await PhotosService.getLatestPhotos('curiosity', {
      earthDate: '2024-01-15',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('rovers/curiosity/photos'),
      expect.any(Object)
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('earth_date=2024-01-15'),
      expect.any(Object)
    );
  });

  it('includes API key in requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockNASAResponse,
    } as Response);

    await PhotosService.getLatestPhotos('curiosity');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('api_key='),
      expect.any(Object)
    );
  });

  it('applies limit parameter correctly', async () => {
    const limitedResponse = {
      latest_photos: mockNASAResponse.latest_photos.slice(0, 1),
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => limitedResponse,
    } as Response);

    const result = await PhotosService.getLatestPhotos('curiosity', {
      limit: 1,
    });

    expect(result.data.photos).toHaveLength(1);
    expect(result.meta.count).toBe(1);
  });

  it('applies camera filter parameter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockNASAResponse,
    } as Response);

    await PhotosService.getLatestPhotos('curiosity', { camera: 'MAST' });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('camera=MAST'),
      expect.any(Object)
    );
  });

  it('handles pagination parameter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockNASAResponse,
    } as Response);

    await PhotosService.getLatestPhotos('curiosity', { page: 2 });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('page=2'),
      expect.any(Object)
    );
  });

  it('uses DEMO_KEY when NASA_API_KEY is not set', async () => {
    delete process.env.NASA_API_KEY;

    // Clear module cache to ensure the service re-reads the environment
    jest.resetModules();
    const { PhotosService: ReloadedPhotosService } = await import(
      '@/features/photos/photos-service'
    );

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockNASAResponse,
    } as Response);

    await ReloadedPhotosService.getLatestPhotos('curiosity');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('api_key=DEMO_KEY'),
      expect.any(Object)
    );
  });

  it('transforms photo for display correctly', () => {
    const mockPhoto = {
      id: 102693,
      sol: 1000,
      earthDate: '2015-05-30',
      camera: {
        id: 22,
        name: 'MAST' as const,
        fullName: 'Mast Camera',
        roverId: 5,
      },
      imgSrc: 'https://example.com/photo1.jpg',
      rover: {
        id: 5,
        name: 'curiosity' as RoverName,
        landingDate: '2012-08-05',
        launchDate: '2011-11-26',
        status: 'active' as const,
        maxSol: 1200,
        maxDate: '2024-01-15',
        totalPhotos: 500000,
      },
      lastUpdated: '2024-01-15T12:00:00Z',
    };

    const displayPhoto = PhotosService.transformForDisplay(mockPhoto);

    expect(displayPhoto.loadingState).toBe('idle');
    expect(displayPhoto.altText).toContain('Photo from curiosity rover');
    expect(displayPhoto.altText).toContain('Sol 1000');
    expect(displayPhoto.altText).toContain('Mast Camera');
    expect(displayPhoto.thumbnailSrc).toBe(mockPhoto.imgSrc);
  });

  it('retries failed requests', async () => {
    // First two calls fail, third succeeds
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockNASAResponse,
      } as Response);

    const result = await PhotosService.getLatestPhotos('curiosity');

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(result.data.status).toBe('success');
    expect(result.data.photos).toHaveLength(2);
  });

  it('handles timeout properly', async () => {
    const mockAbortController = {
      abort: jest.fn(),
      signal: { aborted: false } as AbortSignal,
    };

    jest
      .spyOn(global, 'AbortController')
      .mockImplementation(() => mockAbortController as AbortController);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockNASAResponse,
    } as Response);

    await PhotosService.getLatestPhotos('curiosity');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        signal: expect.any(Object),
      })
    );
  });
});
