import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useSexualOrientation = () => {
	const [selectedImage, setSelectedImage] = useState<number>(1);
	const navigate = useNavigate();

	const handleImageClick = (index: number) => {
		setSelectedImage(index);
	};

	const handleSubmit = async () => {
		try {
			console.log('ok', selectedImage)
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/users/save-orientation`,
				{
					method: "PATCH",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify({ orientation: selectedImage }),
					credentials: "include",
				}
			);

			if (response.ok) {
				navigate("/step4");
			} else {
				console.error("error");
			}
		} catch (error) {
			console.error("error servor", error);
		}
	};

	return {
		selectedImage,
		handleImageClick,
		handleSubmit,
	};
};
