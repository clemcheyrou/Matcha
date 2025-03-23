import React from "react";
import { useDiscoverNewUsers } from "./hooks/useDiscoverNewUsers.ts";
import { useMatchedUsers } from "./hooks/useMatchedUsers.ts";
import { RiHeart3Fill, RiHeart3Line } from "react-icons/ri";
import socket from "../../../service/socket.js";
import { Link } from "react-router-dom";
import { RiHandHeartFill } from "react-icons/ri";

type GridProps = {
	viewMode: "discovery" | "matched";
};

export const Grid: React.FC<GridProps> = ({ viewMode}) => {
	const discoverData = useDiscoverNewUsers();
	const matchedData = useMatchedUsers();

	const { users, loading, error } =
		viewMode === "discovery" ? discoverData : matchedData;

	const toggleLike = (like: number, user_like: boolean) => {
		if (user_like) {
			socket.emit("unlike", like);
		} else {
			socket.emit("like", like);
		}
	};

	console.log(users)
	if (loading) return <p className="text-center mt-4">Loading...</p>;
	if (error) return <p className="text-center mt-32 mx-6">You're too beautiful to be left alone, so don't wait any longer to check out discovery 💕</p>;
	return (
		<div className="overflow-y-scroll pt-4 mx-1">
			<div className="grid grid-cols-3 gap-2">
				{users.length > 0 ? users.map((user) => (
					<div
						key={user.id}
						className="bg-white shadow-md rounded-lg text-center h-48 flex flex-col justify-center items-center relative"
					>
						<Link
							to={`/user/${user.id}`}
							className="absolute inset-0"
						>
							<img
								src={`${process.env.REACT_APP_API_URL}${user.profile_photo}`}
								alt={user.name}
								className="w-full h-full object-cover rounded-lg"
							/>
							<div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg">
								<div className="absolute left-3 bottom-3 text-left">
									<p className="text-white text-xl m-0">
										{user.age}
									</p>
									<div className="flex items-center gap-x-2">
										<p className="text-white m-0">
											{user.name}
										</p>
										<div
											className={`h-2 w-2 rounded ${
												user.is_connected
													? "bg-green-500"
													: "bg-red-500"
											}`}
										></div>
									</div>
								</div>
							</div>
						</Link>

						<div
							className="absolute top-2 right-2 w-6 h-6 text-white cursor-pointer"
							onClick={() => toggleLike(user.id, user.liked_by_user)}
						>
							{user.liked_by_user ? (
								<RiHeart3Fill className="w-full h-full" />
							) : (
								<RiHeart3Line className="w-full h-full" />
							)}
						</div>
						{user.liked_by_other && (
							<div className="flex space-x-1 align-content items-center absolute bottom-3 right-2 h-6 p-1 text-bg bg-gradient-to-r from-[#f59e0b] via-[#fcd34d] to-[#fcd34d] text-xs rounded">
									<RiHandHeartFill />
									<div>Like</div>
							</div>
						)}
						{user.distance_km && (
							<div className="flex space-x-1 align-content items-center absolute top-3 left-2 h-6 p-1 text-white bg-bg text-xs rounded">
									<div>{user.distance_km.toFixed(1)}km</div>
							</div>
						)}
					</div>
				)) : <p className="text-center mt-32 mx-6">You're too beautiful to be left alone, so don't wait any longer to check out discovery 💕</p>
				}
			</div>
		</div>
	);
};
