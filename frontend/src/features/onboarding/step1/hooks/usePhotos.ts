import { useState } from "react";
import { PhotoFacebookType } from "../types/types";

export const usePhotosFetchFB = () => {
  const [photos, setPhotos] = useState<PhotoFacebookType[]>([]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/facebook/photos`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("error fetching photos");
      }

      const data = await response.json();
      setPhotos(data.data);
    } catch (error) {
      console.error("failed to fetch photos:", error);
    }
  };

  return {
    photos,
    fetchPhotos,
  };
};
