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

export const Grid: React.FC<GridProps> = ({ viewMode }) => {
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
	if (loading) return <p className="text-center mt-4">Loading...</p>;
	return (
		<div className="overflow-y-scroll pt-4">
			<div className="overflow-y-scroll pt-4 mx-1">
				{error ? (
					<div className="text-center text-red-500">
						You're too beautiful to be left alone, so don't wait any longer
						to check out discovery 💕
					</div>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
						{users && users.length > 0 && (
							users.map((user) => (
								<div
									key={user.id}
									className="bg-white shadow-md rounded-lg text-center h-60 flex flex-col justify-center items-center relative"
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
										<div className="absolute inset-0 bg-black bg-opacity-50 rounded-md">
											<div className="absolute left-3 bottom-10 text-left">
												<p className="text-white text-xl m-0">
													{user.age}
												</p>

												<div className="flex items-center gap-x-2">
													<p className="text-white m-0">
													{user && user.name.length > 8 ? user.name.slice(0, 8) + '...' : user.name}
													</p>
													<div
														className={`h-2 w-2 rounded ${
															user.is_connected
																? "bg-green-500"
																: "bg-red-500"
														}`}
													/>
											</div>
											</div>
										</div>
									</Link>
	
									<div className="absolute bottom-0 left-2">
									{user.interests && user.interests.length > 0 && (
									<div className="mb-2">
										<div className="flex flex-wrap gap-1 justify-center">
											{user.interests.slice(0, 2).map((interest, index) => (
												<span
													key={index}
													className="border text-xs text-white px-2 py-0.5 rounded-md text-sm capitalize"
												>
													{interest}
												</span>
											))}
											
											{user.interests.length > 2 && (
												<div
													className="border text-xs text-white px-2 py-0.5 rounded-md text-sm capitalize cursor-pointer"
													title={user.interests.slice(2).join(', ')}
												>
													+ {user.interests.length - 2}
												</div>
											)}
										</div>
									</div>
								)}
									</div>

	
									<div
										className="absolute top-2.5 right-2 w-6 h-6 text-white cursor-pointer"
										onClick={() =>
											toggleLike(user.id, user.liked_by_user)
										}
									>
										{user.liked_by_user ? (
											<RiHeart3Fill className="w-full h-full" />
										) : (
											<RiHeart3Line className="w-full h-full" />
										)}
									</div>
	
									{user.liked_by_other && (
										<div className="flex space-x-1 align-content items-center absolute bottom-10 right-2 h-6 p-1 text-bg bg-gradient-to-r from-[#f59e0b] via-[#fcd34d] to-[#fcd34d] text-xs rounded">
											<RiHandHeartFill />
											<div>Like</div>
										</div>
									)}
	
									{user.distance_km && (
										<div className="flex space-x-1 align-content items-center absolute top-3 left-2 h-6 p-1 text-white text-xs rounded">
											<div className="bg-bg p-1 rounded-md">
												{user.distance_km.toFixed(1)} km
											</div>
												<span className="text-xs ml-2">🔥 {user.fame_count}</span>
										</div>
									)}
								</div>
							))
						)}
					</div>
				)}
			</div>
		</div>
	);
};	