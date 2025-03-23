import React, { useEffect, useRef, useState } from "react";
import { ActionButtonsType } from "./types/types";

export const ActionButtons: React.FC<ActionButtonsType> = ({
    handleClosePopin,
    handleAddPhoto,
    handleFetchPhotosClick,
    handleFileChange
}) => {
    const [showFBButton, setShowFBButton] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.get('provider') === 'facebook') {
          setShowFBButton(true);
        }
      }, []);

    const handleButtonClick = () => {
		if (fileInputRef.current) fileInputRef.current.click();
	};

    return (
        <div>
            <div className="flex">
                <button
                    onClick={handleButtonClick}
                    className="block w-full text-sm text-white mr-4 py-1 px-2 rounded-md border-0 bg-pink text-pink hover:bg-pink"
                >
                    Select a file
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    hidden
                />
                <div className="flex justify-end gap-2 text-xs">
                    <button
                        onClick={handleClosePopin}
                        className="px-2 py-1 text-white rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddPhoto}
                        className="px-2 py-1 text-white bg-pink rounded-lg"
                    >
                        Add
                    </button>
                </div>
            </div>
            {showFBButton && (
            <button
                onClick={handleFetchPhotosClick}
                className="block w-full text-sm text-black py-1 px-2 rounded-md border-0 bg-white text-black hover:bg-pink-100 my-2"
            >
                Load Photos from Facebook
            </button>
            )}
        </div>
    );
};
