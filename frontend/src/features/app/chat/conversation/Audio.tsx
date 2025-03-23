import React from "react";
import { AudioProps } from "../../type/type";

export const Audio: React.FC<AudioProps> = ({ audioUrl }) => {
	return (
		<div className="p-4">
			{audioUrl ? (
				<audio controls src={audioUrl}></audio>
			) : (
				<div>No audio available</div>
			)}
		</div>
	);
};
