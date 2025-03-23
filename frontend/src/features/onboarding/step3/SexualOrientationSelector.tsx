import React, { useState } from "react";
import { BreadcrumbSteps } from "../BreadcrumbSteps.tsx";
import { useNavigate } from "react-router-dom";

export const SexualOrientationSelector = () => {
	const [selectedImage, setSelectedImage] = useState<number>(1);
	const steps = ["Images", "Identity", "Orientation", "Interest"];
	const currentStep = 3;
	const navigate = useNavigate();

	const images = [
		"Man",
		"Woman",
		"Everybody",
	];

	const handleImageClick = (index: number) => {
		setSelectedImage(index);
	};

	const handleSubmit = async () => {
		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/users/save-orientation`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						orientation: selectedImage,
					}),
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

	return (
		<div className="mb-16 h-screen w-screen text-white px-6 md:px-28 lg:px-96 pb-16">
			<div className="mt-12">
				<BreadcrumbSteps steps={steps} currentStep={currentStep} />
				<h1 className="text-center mt-10">I’m looking for?</h1>

				<div className="flex justify-center items-center gap-8 mt-16 image-container">
					{images.map((image, index) => (
						<div
							key={index}
							onClick={() => handleImageClick(index)}
							className={`image-box flex justify-center items-center transition-transform duration-300 transform rounded-md ${
								selectedImage === index ? "scale-105 border-4 border-pink" : "border-2 border-gray-300"
							}`}
							role="button"
							aria-label={`Select image ${index + 1}`}
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									handleImageClick(index);
								}
							}}
						>
							<p className="mt-0">{image}</p>
						</div>
					))}
				</div>
				<button
					onClick={handleSubmit}
					className="w-full mt-16 text-center space-x-4 font-agbalumo text-black rounded-md px-4 py-2 bg-pink text-white cursor-pointer hover:bg-white hover:text-pink mt-16 transition-colors duration-300"
				>
					Next
				</button>
			</div>
		</div>
	);
};
