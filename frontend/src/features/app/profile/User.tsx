import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { User } from "../type/type";
import socket from "../../../service/socket";
import { FiAlertTriangle } from "react-icons/fi";
import { RiHeart3Fill, RiHeart3Line } from "react-icons/ri";
import { FiMessageSquare } from "react-icons/fi";
import { MdBlockFlipped } from "react-icons/md";
import { useCreateChat } from "../chat/hooks/useCreateChat.ts";

export const UserProfile = () => {
	const { userId } = useParams();
	const { createChat } = useCreateChat();
	const [userData, setUserData] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile/${userId}`, { credentials: "include" });
				if (!response.ok) throw new Error("can not find user");
				const data = await response.json();
				setUserData(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
		socket.emit("viewProfile", userId);

		const handleProfileUpdate = (updatedProfile: User) => {
			setUserData((prevData) => {
				if (prevData === null) {
					return updatedProfile;
				}
				return {
					...prevData,
					liked_by_user: updatedProfile.liked_by_user,
					blocked_by_user: updatedProfile.blocked_by_user,
					reported_by_user: updatedProfile.reported_by_user,
				};
			});
		};

		socket.on("profileUpdated", handleProfileUpdate);

		return () => {
			socket.off("profileUpdated", handleProfileUpdate);
		};
	}, [userId]);

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	const toggleLike = (userId: number, liked_by_user: boolean) => {
		socket.emit(liked_by_user ? "unlike" : "like", userId);
	};

	const toggleBlock = (userId: number, blocked_by_user: boolean) => {
		socket.emit(blocked_by_user ? "unblock" : "block", userId);
	};

	const toggleReport = (userId: number, reported_by_user: boolean) => {
		socket.emit(reported_by_user ? "unreport" : "report", userId);
	};

	return (
		<div className="mt-10 mx-6">
			{userData ? (
				<div>
					<img
						src={`${process.env.REACT_APP_API_URL}${userData.profile_photo}`}
						alt={userData.name}
						className="w-full h-96 object-cover rounded-lg"
					/>
					<div className="flex justify-between items-center mt-2">

						<div className="flex items-center">
							<h2 className="font-agbalumo text-5xl mt-0">
								{userData.name} <span className="text-2xl ml-2 opacity-60">{userData.age}</span>
							</h2>
							<div
								className={`h-3 w-3 rounded-full ml-4 ${userData.is_connected ? "bg-green-500" : "bg-red-500"}`}
							></div>
						</div>
						<p className="bg-[#191919] p-2 rounded">{userData.distance_km.toFixed(1)} km from you</p>
					</div>

					{userData.interests && userData.interests?.length > 0 && (
						<div className="mt-4 flex flex-wrap gap-2">
							{userData.interests.map((tag, index) => (
								<span key={index} className="bg-[#191919] text-white px-3 py-1 rounded text-sm capitalize">
									{tag}
								</span>
							))}
						</div>
					)}

					<div className="mt-6">
						<p>{userData.bio}</p>
						<p>fame: {userData?.fame}</p>
					</div>

					<div className="flex justify-between items-center w-full mt-10">
						<div className="flex justify-between items-center space-x-6">
							<div onClick={() => toggleLike(userData.id, userData.liked_by_user)}>
								{userData.liked_by_user ? (
									<RiHeart3Fill className="text-red-500 cursor-pointer" size={32} />
								) : (
									<RiHeart3Line className="cursor-pointer" size={32} />
								)}
							</div>

							{userData.liked_by_user && userData.liked_by_other && (
								<Link to={`/chat`}>
									<FiMessageSquare className="cursor-pointer" onClick={() => createChat(userData.id)} size={32} />
								</Link>
							)}

							<div onClick={() => toggleBlock(userData.id, userData.blocked_by_user)}>
								<MdBlockFlipped className={`cursor-pointer ${userData.blocked_by_user ? "text-red-500" : "text-white"}`} size={32} />
							</div>
						</div>

						<button
							className={`flex items-center gap-2 text-white p-2 rounded cursor-pointer text-xs ${userData.reported_by_user ? "bg-yellow-500 hover:bg-yellow-600" : "bg-[#191919] hover:bg-[#292929]"}`}
							onClick={() => toggleReport(userData.id, userData.reported_by_user)}
						>
							<FiAlertTriangle size={20} />
							<span>{userData.reported_by_user ? "Undo Report" : "Report fake profile"}</span>
						</button>
					</div>
				</div>
			) : (
				<div>User not found</div>
			)}
		</div>
	);
};
