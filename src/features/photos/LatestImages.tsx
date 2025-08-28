'use client';

/**
 * Latest Mars Rover Images Component
 * Displays a gallery of the most recent photos from Mars rovers
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Calendar,
  MapPin,
  Info,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
} from 'lucide-react';
import { usePhotosData } from './usePhotosData';
import { PhotosService } from './photos-service';
import {
  RoverName,
  PhotoDisplayData,
} from '@/types/photos';

interface LatestImagesProps {
  /** Initial rover to display */
  initialRover?: RoverName;
  /** Maximum number of images to display */
  limit?: number;
  /** Show rover selector */
  showRoverSelector?: boolean;
  /** Show camera filter */
  showCameraFilter?: boolean;
}

interface PhotoModalProps {
  photo: ReturnType<typeof PhotosService.transformForDisplay> | null;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

const PhotoModal: React.FC<PhotoModalProps> = ({
  photo,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
}) => {
  if (!photo || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative max-h-[90vh] max-w-[90vw] p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Navigation buttons */}
          {canGoPrevious && (
            <button
              onClick={onPrevious}
              className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {canGoNext && (
            <button
              onClick={onNext}
              className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          {/* Main image */}
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            src={photo.imgSrc}
            alt={photo.altText}
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
            loading="eager"
          />

          {/* Photo information */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="mt-4 rounded-lg bg-black/60 p-4 text-white backdrop-blur-sm"
          >
            <div className="grid gap-2 text-sm md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Camera size={16} />
                <span>{photo.camera.fullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  Sol {photo.sol} ({photo.earthDate})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span className="capitalize">{photo.rover.name} Rover</span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink size={16} />
                <a
                  href={photo.imgSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 hover:underline"
                >
                  View Full Size
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const LatestImages: React.FC<LatestImagesProps> = ({
  initialRover = 'curiosity',
  limit = 12,
  showRoverSelector = true,
  showCameraFilter = true,
}) => {
  const [selectedRover, setSelectedRover] = useState<RoverName>(initialRover);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null
  );

  // Always fetch photos without camera filter to get available cameras
  const photosOptions = useMemo(() => ({ limit }), [limit]);

  const { data, isLoading, error, refetch } = usePhotosData(
    selectedRover,
    photosOptions
  );

  // Get available cameras from current photos (only cameras with actual photos)
  const availableCameras = useMemo(() => {
    if (!data?.data.photos) return [];
    const cameras = data.data.photos.map((photo) => photo.camera);
    const unique = cameras.filter(
      (camera, index, self) =>
        index === self.findIndex((c) => c.name === camera.name)
    );
    return unique;
  }, [data]);

  // Transform and filter photos for display
  const displayPhotos = useMemo(() => {
    if (!data?.data.photos) return [];
    
    let photos = data.data.photos;
    
    // Apply camera filter if selected
    if (selectedCamera) {
      photos = photos.filter((photo) => photo.camera.name === selectedCamera);
    }
    
    return photos.map(PhotosService.transformForDisplay);
  }, [data, selectedCamera]);

  const handlePhotoClick = (index: number): void => {
    setSelectedPhotoIndex(index);
  };

  const handleModalClose = (): void => {
    setSelectedPhotoIndex(null);
  };

  const handleModalNext = (): void => {
    if (
      selectedPhotoIndex !== null &&
      selectedPhotoIndex < displayPhotos.length - 1
    ) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const handleModalPrevious = (): void => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const selectedPhoto: PhotoDisplayData | null =
    selectedPhotoIndex !== null &&
    selectedPhotoIndex < displayPhotos.length &&
    displayPhotos[selectedPhotoIndex]
      ? displayPhotos[selectedPhotoIndex]
      : null;
  const canGoNext =
    selectedPhotoIndex !== null &&
    selectedPhotoIndex < displayPhotos.length - 1;
  const canGoPrevious = selectedPhotoIndex !== null && selectedPhotoIndex > 0;

  if (error) {
    return (
      <div className="rounded-lg border-2 border-red-200 bg-red-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <Info className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-red-800">
          Unable to Load Images
        </h3>
        <p className="mb-4 text-sm text-red-600">
          {error.message || 'Failed to fetch rover images. Please try again.'}
        </p>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Latest Images</h2>
          <p className="text-sm text-slate-300">
            Recent photos from Mars rovers
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Rover selector */}
          {showRoverSelector && (
            <select
              value={selectedRover}
              onChange={(e) => {
                setSelectedRover(e.target.value as RoverName);
                setSelectedCamera(''); // Clear camera filter when switching rovers
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              <option value="curiosity">Curiosity</option>
              <option value="perseverance">Perseverance</option>
            </select>
          )}

          {/* Camera filter */}
          {showCameraFilter && availableCameras.length > 0 && (
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              <option value="">All Cameras</option>
              {availableCameras.map((camera) => (
                <option key={camera.name} value={camera.name}>
                  {camera.name} - {camera.fullName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Photo gallery */}
      <div className="relative">
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
        )}

        {!isLoading && displayPhotos.length === 0 && (
          <div className="py-12 text-center">
            <Camera className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-medium text-white">
              No Images Available
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              No photos found for the selected criteria.
            </p>
          </div>
        )}

        {!isLoading && displayPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {displayPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative cursor-pointer overflow-hidden rounded-lg bg-gray-100 shadow-sm transition-all hover:shadow-lg"
                onClick={() => handlePhotoClick(index)}
              >
                <div className="aspect-square">
                  <img
                    src={photo.imgSrc}
                    alt={photo.altText}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Overlay with photo info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="absolute right-4 bottom-4 left-4 text-white">
                    <p className="text-xs font-medium">{photo.camera.name}</p>
                    <p className="text-xs opacity-90">
                      Sol {photo.sol} • {photo.earthDate}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Photo modal */}
      <PhotoModal
        photo={selectedPhoto}
        isOpen={selectedPhotoIndex !== null}
        onClose={handleModalClose}
        onNext={handleModalNext}
        onPrevious={handleModalPrevious}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
      />

      {/* Photo count indicator */}
      {!isLoading && displayPhotos.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Showing {displayPhotos.length} image
            {displayPhotos.length !== 1 ? 's' : ''}
            {data?.data.totalPhotos &&
              data.data.totalPhotos > displayPhotos.length && (
                <span> of {data.data.totalPhotos} available</span>
              )}
          </p>
        </div>
      )}
    </div>
  );
};
