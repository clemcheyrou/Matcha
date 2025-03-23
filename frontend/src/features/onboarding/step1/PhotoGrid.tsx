import React from 'react';
import { RxCross2 } from "react-icons/rx";
import { useDispatch } from 'react-redux';
import { deletePhoto } from '../../../store/slice/photosSlice.ts';
import { AppDispatch } from '../../../store/store.ts';
import { PhotoGridType } from './types/types.ts';


export const PhotoGrid: React.FC<PhotoGridType> = ({ photos, onAddPhotoClick }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleDeletePhoto = (photoId: number) => {
    dispatch(deletePhoto(photoId));
  };

  const gridItems = [
    ...photos,
    ...Array(6 - photos.length).fill(null),
  ];

  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      {gridItems.map((photo, index) => (
        <div key={index} className="flex items-center justify-center w-full h-52 border border-gray-300 rounded-md bg-gray-400">
          {photo ? (
            <div className="relative w-full h-full">
              <img
                src={`${process.env.REACT_APP_API_URL}${photo.url}`}
                alt=""
                className="w-full h-full object-cover rounded-md"
              />
              <div
                className="absolute bottom-0 right-0 translate-x-2 translate-y-2 h-8 w-8 rounded-full bg-white flex items-center justify-center cursor-pointer hover:opacity-60"
                onClick={() => handleDeletePhoto(photo.id)}
              >
                <RxCross2 className="text-gray-500 text-sm font-bold" />
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-center w-full h-52 border border-gray-300 rounded-md bg-gray-400 hover:bg-transparent cursor-pointer"
              onClick={onAddPhotoClick}
            >
              <span className="text-3xl text-white">+</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
