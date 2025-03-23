import React, { useState } from 'react';
import { usePhotosUploadFB } from './hooks/usePhotosUploadFB.ts';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export const PhotosFB = ({ photos, handleClosePopin }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 6;

  const { isUploading, message, handleAddPhoto } = usePhotosUploadFB();

  const indexOfLastPhoto = currentPage * photosPerPage;
  const indexOfFirstPhoto = indexOfLastPhoto - photosPerPage;

  const currentPhotos = photos.slice(indexOfFirstPhoto, indexOfLastPhoto);

  const totalPages = Math.ceil(photos.length / photosPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return photos.length > 0 ? (
    <div>
      <div className="mb-4">
        <div className="mt-2 grid grid-cols-3 gap-2">
          {currentPhotos.length > 0 &&
            currentPhotos.map((photo, index) => {
              const highQualityImage = photo.images[photo.images.length - 1].source;
              return (
                <div key={index} className="relative">
                  <img
                    src={highQualityImage}
                    alt="Facebook"
                    className="w-full h-20 object-cover rounded-md"
                  />
                  <button
                    onClick={() => handleAddPhoto(highQualityImage, handleClosePopin)}
                    className="absolute bottom-2 right-2 text-white bg-black p-1 rounded-md text-xs"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Add'}
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      <div className="flex justify-center space-x-2 my-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 bg-white text-sm rounded-md disabled:opacity-50 text-black"
        >
          <FaArrowLeft />
        </button>
        <span className="flex items-center text-sm text-white">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 bg-white text-sm rounded-md disabled:opacity-50 text-black"
        >
          <FaArrowRight />
        </button>
      </div>

      {message && <p className="text-center text-sm pt-0 mb-4">{message}</p>}
    </div>
  ) : null;
};
