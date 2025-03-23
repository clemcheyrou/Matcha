import React from "react";
import { PhotoPreviewType } from "./types/types";

export const PhotoPreview: React.FC<PhotoPreviewType> = ({ previewImage }) => {
  return (
    <div className="mb-4">
      {previewImage && (
        <img
          src={previewImage}
          alt="Preview"
          className="w-full h-60 object-cover rounded-md"
        />
      )}
    </div>
  );
};
