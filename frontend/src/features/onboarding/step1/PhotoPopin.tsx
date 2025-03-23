import React from "react";
import { usePhotosFetchFB } from "./hooks/usePhotos.ts";
import { PhotoPreview } from "./PhotoPreview.tsx";
import { ActionButtons } from "./ActionButtons.tsx";
import { PhotosFB } from "./PhotoFB.tsx";

interface PhotoPopinProps {
	isPopinOpen: boolean;
	handleClosePopin: () => void;
	handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	handleAddPhoto: () => void;
	previewImage: string | null;
}

export const PhotoPopin: React.FC<PhotoPopinProps> = ({
	isPopinOpen,
	handleClosePopin,
	handleFileChange,
	handleAddPhoto,
	previewImage,
}) => {
	const { photos, fetchPhotos } = usePhotosFetchFB();
	const handleFetchPhotosClick = () => {
		fetchPhotos();
	};

	return isPopinOpen ? (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
			<div className="bg-bg px-6 pb-6 rounded-lg shadow-lg w-96">
				<p className="text-xl text-white font-semibold mb-2 text-black font-agbalumo">
					Add a Photo
				</p>

				<PhotoPreview previewImage={previewImage} />
				<PhotosFB photos={photos} handleClosePopin={handleClosePopin}/>

				<div>
					<ActionButtons
						handleClosePopin={handleClosePopin}
						handleAddPhoto={handleAddPhoto}
						handleFetchPhotosClick={handleFetchPhotosClick}
						handleFileChange={handleFileChange}
					/>
				</div>
			</div>
		</div>
	) : null;
};

