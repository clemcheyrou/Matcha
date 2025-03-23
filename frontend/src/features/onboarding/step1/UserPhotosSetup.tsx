import React, { useState, useEffect } from "react";
import { BreadcrumbSteps } from "../BreadcrumbSteps.tsx";
import { PhotoGrid } from "./PhotoGrid.tsx";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPhotos, addPhoto } from "../../../store/slice/photosSlice.ts";
import { AppDispatch, RootState } from "../../../store/store.ts";
import { PhotoPopin } from "./PhotoPopin.tsx";

export const UserPhotosSetup = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { photos, loading, error } = useSelector((state: RootState) => state.photos);
  const [isPopinOpen, setIsPopinOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleOpenPopin = () => {
    setIsPopinOpen(true);
  };

  const handleClosePopin = () => {
    setIsPopinOpen(false);
    setPreviewImage(null);
    setFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAddPhoto = async () => {
    if (file) {
      try {
        await dispatch(addPhoto(file));
        dispatch(fetchPhotos());
        handleClosePopin();
      } catch (error) {
        console.error("error to add photo:", error);
      }
    }
  };

  useEffect(() => {
    dispatch(fetchPhotos());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const isNextDisabled = photos.length !== 5;

  return (
    <div className="mb-16 h-screen w-screen text-white px-6 md:px-28 lg:px-96 pb-16">
      <div className="mt-12">
        <BreadcrumbSteps
          steps={["Images", "Identity", "Orientation", "Interest"]}
          currentStep={1}
        />
        <h1 className="text-center mt-10">Finish your profile</h1>
        <h2 className="text-center mb-10">Select 5 images of you</h2>

        <PhotoGrid photos={photos} onAddPhotoClick={handleOpenPopin} />
		<div className="w-full px-4">
			<Link
				to="/step2"
				className={`w-full block text-center space-x-4 font-agbalumo text-black rounded-md px-4 py-2 mt-6 ${
				isNextDisabled
					? "bg-gray-400 text-gray-700 cursor-not-allowed"
					: "bg-pink text-white cursor-pointer hover:bg-white hover:text-pink"
				} mt-16`}
				onClick={(e) => {
				if (isNextDisabled) e.preventDefault();
				}}
			>
				Next
			</Link>
		</div>
      </div>

      <PhotoPopin
        isPopinOpen={isPopinOpen}
        handleClosePopin={handleClosePopin}
        handleFileChange={handleFileChange}
        handleAddPhoto={handleAddPhoto}
        previewImage={previewImage}
      />
    </div>
  );
};
