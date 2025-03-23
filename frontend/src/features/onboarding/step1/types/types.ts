export type PhotoPreviewType = {
    previewImage: string | null;
}

export type ActionButtonsType = {
    handleClosePopin: () => void;
    handleAddPhoto: () => void;
    handleFetchPhotosClick: () => void;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export type PhotoGridType = {
    photos: { id: number; url: string }[];
    onAddPhotoClick: () => void;
}

export type PhotoFacebookType = {
    images: { source: string }[];
}