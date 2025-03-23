import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../store/store';
import { fetchPhotos } from '../../../../store/slice/photosSlice.ts';

export const usePhotosUploadFB = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const dispatch = useDispatch<AppDispatch>();

  const handleAddPhoto = async (highQualityImage: string, handleClosePopin: () => void) => {
    setIsUploading(true);
    setMessage('');
  
    try {
      const formData = new FormData();
      formData.append('imageUrl', highQualityImage);
      console.log(highQualityImage);

      const uploadResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/uploads/upload-image`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
  
      const data = await uploadResponse.json();
  
      if (uploadResponse.ok) {
        setMessage('successfully uploaded');
        dispatch(fetchPhotos());
        handleClosePopin();
      } else {
        setMessage(data.message || 'error uploading image');
      }
    } catch (error) {
      setMessage('error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    message,
    handleAddPhoto,
  };
};
