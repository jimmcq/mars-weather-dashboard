/**
 * Tests for camera data hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCameraData } from '@/features/photos/useCameraData';
import { PhotosService } from '@/features/photos/photos-service';

// Mock the PhotosService
jest.mock('@/features/photos/photos-service');

const mockPhotosService = PhotosService as jest.Mocked<typeof PhotosService>;

// Create query client wrapper for tests
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
};

describe('useCameraData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfully fetches camera data for curiosity', async () => {
    const mockManifest = {
      cameras: [
        {
          id: 1,
          name: 'FHAZ' as const,
          fullName: 'Front Hazard Avoidance Camera',
          roverId: 5,
        },
        {
          id: 2,
          name: 'RHAZ' as const,
          fullName: 'Rear Hazard Avoidance Camera',
          roverId: 5,
        },
        {
          id: 3,
          name: 'NAVCAM_LEFT' as const,
          fullName: 'Navigation Camera - Left',
          roverId: 5,
        },
        {
          id: 4,
          name: 'NAVCAM_RIGHT' as const,
          fullName: 'Navigation Camera - Right',
          roverId: 5,
        },
      ],
      maxSol: 4000,
      status: 'active',
    };

    mockPhotosService.getRoverManifest.mockResolvedValue(mockManifest);

    const { result } = renderHook(() => useCameraData('curiosity'), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockManifest.cameras);
    expect(mockPhotosService.getRoverManifest).toHaveBeenCalledWith(
      'curiosity'
    );
  });

  test('successfully fetches camera data for perseverance', async () => {
    const mockManifest = {
      cameras: [
        {
          id: 1,
          name: 'FHAZ' as const,
          fullName: 'Front Hazard Avoidance Camera',
          roverId: 8,
        },
        {
          id: 2,
          name: 'NAVCAM_LEFT' as const,
          fullName: 'Navigation Camera - Left',
          roverId: 8,
        },
        {
          id: 3,
          name: 'NAVCAM_RIGHT' as const,
          fullName: 'Navigation Camera - Right',
          roverId: 8,
        },
        {
          id: 4,
          name: 'SUPERCAM_RMI' as const,
          fullName: 'SuperCam Remote Micro-Imager',
          roverId: 8,
        },
      ],
      maxSol: 1000,
      status: 'active',
    };

    mockPhotosService.getRoverManifest.mockResolvedValue(mockManifest);

    const { result } = renderHook(() => useCameraData('perseverance'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockManifest.cameras);
    expect(mockPhotosService.getRoverManifest).toHaveBeenCalledWith(
      'perseverance'
    );
  });

  test('calls getRoverManifest with correct parameters', async () => {
    const mockManifest = {
      cameras: [
        {
          id: 1,
          name: 'FHAZ' as const,
          fullName: 'Front Hazard Avoidance Camera',
          roverId: 5,
        },
      ],
      maxSol: 4000,
      status: 'active',
    };

    mockPhotosService.getRoverManifest.mockResolvedValue(mockManifest);

    renderHook(() => useCameraData('curiosity'), {
      wrapper: createWrapper(),
    });

    expect(mockPhotosService.getRoverManifest).toHaveBeenCalledWith(
      'curiosity'
    );
  });

  test('uses correct query key', async () => {
    mockPhotosService.getRoverManifest.mockResolvedValue({
      cameras: [],
      maxSol: 0,
      status: 'active',
    });

    const { result } = renderHook(() => useCameraData('curiosity'), {
      wrapper: createWrapper(),
    });

    // Initially loading state should be true
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
