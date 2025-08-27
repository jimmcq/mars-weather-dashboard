/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { LatestImages } from '@/features/photos/LatestImages';
import { usePhotosData } from '@/features/photos/usePhotosData';
import { LatestPhotosData, MarsPhoto } from '@/types/photos';

// Mock the usePhotosData hook
jest.mock('@/features/photos/usePhotosData');
const mockUsePhotosData = jest.mocked(usePhotosData);

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.ComponentProps<'div'>): React.ReactElement => (
      <div {...props}>{children}</div>
    ),
    img: ({
      children,
      ...props
    }: React.ComponentProps<'img'>): React.ReactElement => (
      <img alt="test" {...props}>
        {children}
      </img>
    ),
  },
  AnimatePresence: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactNode => children,
}));

// Create mock photo data
const createMockPhoto = (id: number, sol: number = 1000): MarsPhoto => ({
  id,
  sol,
  earthDate: '2024-01-15',
  camera: {
    id: 1,
    name: 'MAST',
    fullName: 'Mast Camera',
    roverId: 5,
  },
  imgSrc: `https://example.com/photo-${id}.jpg`,
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
});

const mockPhotosData: LatestPhotosData = {
  photos: [
    createMockPhoto(1, 1000),
    createMockPhoto(2, 1001),
    createMockPhoto(3, 1002),
  ],
  totalPhotos: 3,
  rover: 'curiosity',
  lastFetch: '2024-01-15T12:00:00Z',
  status: 'success',
};

const renderComponent = (component: React.ReactElement): void => {
  render(component);
};

describe('LatestImages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    mockUsePhotosData.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof usePhotosData>);

    renderComponent(<LatestImages />);

    expect(screen.getByText('Latest Images')).toBeInTheDocument();

    // Check for loading skeleton
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('renders photos successfully', async () => {
    mockUsePhotosData.mockReturnValue({
      data: {
        data: mockPhotosData,
        meta: {
          count: 3,
          requestTime: '2024-01-15T12:00:00Z',
          cached: false,
        },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof usePhotosData>);

    renderComponent(<LatestImages />);

    await waitFor(() => {
      expect(screen.getByText('Latest Images')).toBeInTheDocument();
      expect(
        screen.getByText('Recent photos from Mars rovers')
      ).toBeInTheDocument();
    });

    // Check that photos are rendered
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);

    // Check photo count
    expect(screen.getByText('Showing 3 images')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    const mockRefetch = jest.fn();
    const error = new Error('Failed to fetch photos');

    mockUsePhotosData.mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof usePhotosData>);

    renderComponent(<LatestImages />);

    expect(screen.getByText('Unable to Load Images')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch photos')).toBeInTheDocument();

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when no photos available', async () => {
    mockUsePhotosData.mockReturnValue({
      data: {
        data: {
          ...mockPhotosData,
          photos: [],
          totalPhotos: 0,
        },
        meta: {
          count: 0,
          requestTime: '2024-01-15T12:00:00Z',
          cached: false,
        },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof usePhotosData>);

    renderComponent(<LatestImages />);

    await waitFor(() => {
      expect(screen.getByText('No Images Available')).toBeInTheDocument();
      expect(
        screen.getByText('No photos found for the selected criteria.')
      ).toBeInTheDocument();
    });
  });

  it('handles rover selection change', async () => {
    const mockRefetch = jest.fn();

    mockUsePhotosData.mockReturnValue({
      data: {
        data: mockPhotosData,
        meta: {
          count: 3,
          requestTime: '2024-01-15T12:00:00Z',
          cached: false,
        },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof usePhotosData>);

    renderComponent(<LatestImages showRoverSelector={true} />);

    const roverSelect = screen.getByDisplayValue('Curiosity');
    expect(roverSelect).toBeInTheDocument();

    fireEvent.change(roverSelect, { target: { value: 'perseverance' } });

    await waitFor(() => {
      expect(roverSelect).toHaveValue('perseverance');
    });
  });

  it('handles camera filter change', async () => {
    const mockPhotosWithMultipleCameras: LatestPhotosData = {
      ...mockPhotosData,
      photos: [
        createMockPhoto(1, 1000),
        {
          ...createMockPhoto(2, 1001),
          camera: {
            id: 2,
            name: 'NAVCAM',
            fullName: 'Navigation Camera',
            roverId: 5,
          },
        },
      ],
    };

    mockUsePhotosData.mockReturnValue({
      data: {
        data: mockPhotosWithMultipleCameras,
        meta: {
          count: 2,
          requestTime: '2024-01-15T12:00:00Z',
          cached: false,
        },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof usePhotosData>);

    renderComponent(<LatestImages showCameraFilter={true} />);

    await waitFor(() => {
      const cameraSelect = screen.getByDisplayValue('All Cameras');
      expect(cameraSelect).toBeInTheDocument();

      // Check that camera options are present
      expect(screen.getByText(/MAST - Mast Camera/)).toBeInTheDocument();
      expect(
        screen.getByText(/NAVCAM - Navigation Camera/)
      ).toBeInTheDocument();
    });
  });

  it('opens photo modal when image is clicked', async () => {
    mockUsePhotosData.mockReturnValue({
      data: {
        data: mockPhotosData,
        meta: {
          count: 3,
          requestTime: '2024-01-15T12:00:00Z',
          cached: false,
        },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof usePhotosData>);

    renderComponent(<LatestImages />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(3);
    });

    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
    const firstImage = images[0];
    if (firstImage) {
      fireEvent.click(firstImage);
    }

    // Modal should open with photo details
    await waitFor(() => {
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    // Close modal
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
  });

  it('respects limit prop', async () => {
    const largePhotosData: LatestPhotosData = {
      ...mockPhotosData,
      photos: Array.from({ length: 20 }, (_, i) =>
        createMockPhoto(i + 1, 1000 + i)
      ),
      totalPhotos: 20,
    };

    mockUsePhotosData.mockReturnValue({
      data: {
        data: largePhotosData,
        meta: {
          count: 20,
          requestTime: '2024-01-15T12:00:00Z',
          cached: false,
        },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof usePhotosData>);

    renderComponent(<LatestImages limit={5} />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(20); // All photos from mock data are displayed
    });
  });
});
