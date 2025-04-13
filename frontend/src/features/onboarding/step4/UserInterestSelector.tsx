import React from "react";
import { BreadcrumbSteps } from "../BreadcrumbSteps.tsx";
import { useUserInterests } from "./hooks/useUserInterests.ts";

const interestsList = [
	"Vegan",
	"Geek",
	"Piercing",
	"Music",
	"Gaming",
	"Fitness",
	"Travel",
	"Books",
	"Movies",
	"Art",
];

const Tag = ({ interest, isSelected, toggleInterest }) => (
	<div
		onClick={() => toggleInterest(interest)}
		className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-all
      ${
			isSelected
				? "bg-pink text-white"
				: "border text-white hover:bg-gray-300 hover:text-black"
		}`}
	>
		{interest}
	</div>
);

export const UserInterestSelector = () => {
	const steps = ["Images", "Identity", "Orientation", "Interest"];
	const currentStep = 4;

	const {
		selectedInterests,
		toggleInterest,
		handleSubmit,
		isNextDisabled,
	} = useUserInterests();

	return (
		<div className="mb-16 h-screen w-screen text-white px-6 md:px-28 lg:px-96 pb-16">
			<div className="mt-12">
				<BreadcrumbSteps steps={steps} currentStep={currentStep} />
				<h1 className="text-center mt-10">What I like?</h1>

				<div className="flex flex-wrap gap-3 justify-center mt-10">
					{interestsList.map((interest) => (
						<div key={interest}>
							<Tag
								interest={interest}
								isSelected={selectedInterests.includes(interest)}
								toggleInterest={toggleInterest}
							/>
						</div>
					))}
				</div>

				<div className="mt-4">
					<button
						onClick={handleSubmit}
						className={`w-full text-center space-x-4 font-agbalumo text-black rounded-md px-4 py-2 mt-6 text-white cursor-pointer mt-16
							${isNextDisabled
								? "bg-gray-400 text-gray-700 cursor-not-allowed"
								: "bg-pink text-white cursor-pointer hover:bg-white hover:text-pink"
							} mt-16`}
					>
						Next
					</button>
				</div>
			</div>
		</div>
	);
};
