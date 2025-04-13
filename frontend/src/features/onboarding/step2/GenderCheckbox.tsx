import React from "react";
import { GenderProps } from "./type/type";

export const GenderCheckbox: React.FC<GenderProps> = ({ selected, setSelected }) => {
	return (
		<div className="space-y-4 mt-6">
			<label className="flex items-center space-x-2 cursor-pointer">
				<input
					type="radio"
					name="gender"
					value="Man"
					checked={selected === "Man"}
					onChange={() => setSelected("Man")}
					className="hidden peer"
				/>
				<div className="w-6 h-6 border border-pink-500 rounded-md peer-checked:bg-pink peer-checked:border-pink-500 flex items-center justify-center">
					{selected === "Man" && (
						<svg
							className="w-4 h-4 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M3 13l4 4L19 4"
							/>
						</svg>
					)}
				</div>
				<span className="font-light">Man</span>
			</label>

			<label className="flex items-center space-x-2 cursor-pointer">
				<input
					type="radio"
					name="gender"
					value="Woman"
					checked={selected === "Woman"}
					onChange={() => setSelected("Woman")}
					className="hidden peer"
				/>
				<div className="w-6 h-6 border border-pink-500 rounded-md peer-checked:bg-pink peer-checked:border-pink-500 flex items-center justify-center">
					{selected === "Woman" && (
						<svg
							className="w-4 h-4 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					)}
				</div>
				<span className="font-light">Woman</span>
			</label>
		</div>
	);
};
