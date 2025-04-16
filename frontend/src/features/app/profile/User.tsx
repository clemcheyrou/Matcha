import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { User } from "../type/type";
import socket from "../../../service/socket";
import { FiAlertTriangle, FiMessageSquare } from "react-icons/fi";
import { RiHeart3Fill, RiHeart3Line, RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { MdBlockFlipped } from "react-icons/md";
import { useCreateChat } from "../chat/hooks/useCreateChat.ts";
import { lastConnection } from "../chat/conversation/Header.tsx";

export const UserProfile = () => {
	const { userId } = useParams();
	const { createChat } = useCreateChat();
	const [userData, setUserData] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile/${userId}`, { credentials: "include" });
				if (!response.ok) throw new Error("Can not find user");
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
				if (!prevData) return updatedProfile;
				return {
					...prevData,
					liked_by_user: updatedProfile.liked_by_user,
					blocked_by_user: updatedProfile.blocked_by_user,
					fame_rating: updatedProfile.fame_rating
				};
			});
		};

		const handleProfileUpdateReport = (updatedProfile: User) => {
			setUserData((prevData) => {
				if (!prevData) return updatedProfile;
				return {
					...prevData,
					reported_by_user: updatedProfile.reported_by_user,
				};
			});
		};
		
		socket.on("profileUpdated", handleProfileUpdate);
		socket.on("profileUpdatedReport", handleProfileUpdateReport);
		return () => {
			socket.off("profileUpdated", handleProfileUpdate);
			socket.on("profileUpdatedReport", handleProfileUpdateReport);
		}
	}, [userId]);

	
	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	const toggleLike = () => {
		if (userData) socket.emit(userData.liked_by_user ? "unlike" : "like", userData.id);
	};

	const toggleBlock = () => {
		if (userData) socket.emit(userData.blocked_by_user ? "unblock" : "block", userData.id);
	};

	const toggleReport = () => {
		if (userData) socket.emit(userData.reported_by_user ? "unreport" : "report", userData.id);
	};

	const nextPhoto = () => {
		if (userData?.photos.length) {
			setCurrentPhotoIndex((prev) => (prev === userData.photos.length - 1 ? 0 : prev + 1));
		}
	};

	const prevPhoto = () => {
		if (userData?.photos.length) {
			setCurrentPhotoIndex((prev) => (prev === 0 ? userData.photos.length - 1 : prev - 1));
		}
	};

	return (
		<div className="mt-10 mx-6">
			{userData ? (
				<div className="rounded-lg overflow-hidden shadow-lg border-none">
					<div className="relative w-full h-[320px]">
						<div
							className="absolute top-0 left-0 w-full h-full bg-cover bg-center transition-all duration-500"
							style={{
								backgroundImage: `url(${process.env.REACT_APP_API_URL}${userData.photos[currentPhotoIndex] || userData.profile_photo})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}
						/>

						{userData.photos.length > 1 && (
							<>
								<div className="absolute inset-0 flex items-center justify-between px-4">
									<button className="rounded-full bg-black/30 text-white hover:bg-black/50 p-2 transition-colors" onClick={prevPhoto}>
										<RiArrowDropLeftLine className="h-6 w-6" />
									</button>
									<button className="rounded-full bg-black/30 text-white hover:bg-black/50 p-2 transition-colors" onClick={nextPhoto}>
										<RiArrowDropRightLine className="h-6 w-6" />
									</button>
								</div>

								<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
									{userData.photos.map((_, index) => (
										<div
											key={index}
											className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
												index === currentPhotoIndex ? "bg-white w-12" : "bg-white/50 w-6"
											}`}
											onClick={() => setCurrentPhotoIndex(index)}
										/>
									))}
								</div>
							</>
						)}
					</div>

					<div className="p-2">
						<div className="flex justify-between items-center mb-4">
							<div className="w-full">
								<div className="flex justify-between items-center w-full">
									<div className="flex justif-content items-center">
										<h2 className="text-3xl font-bold font-agbalumo mt-0 mr-4">{userData.username}</h2>
										<div
											className={`h-2 w-2 rounded mr-2 mt-2 ${
												userData.is_connected
													? "bg-green-500"
													: "bg-red-500"
											}`}
										/>
										{userData.last_connected_at && !userData.is_connected && <p className="mt-2 text-[12px]">{lastConnection(userData.last_connected_at)}</p>}
									</div>
									<div className="flex items-center justify-between">
										{userData.distance_km && userData.distance_km >= 0 &&
											<div className="bg-bg p-1 rounded-md">
												{userData.distance_km === 0 ? '0 km' : userData.distance_km.toFixed(1)} km
											</div>
										}
										<div className="flex items-center gap-1 px-3 rounded-full">
											<span className="font-medium text-pink-700">🔥 {userData.fame_rating}</span>
										</div>
									</div>
								</div>
								<p className="text-xs text-gray-500 mt-0">{userData.firstname} {userData.lastname} <span className="text-white">({userData.gender} {userData.orientation === 0 ? 'Heterosexual' : userData.orientation === 1 ? 'Homosexual' : 'Bisexual'})</span></p>
								<p className="text-lg text-gray-500">{userData.age} years</p>
							</div>
						</div>
						{userData.interests && userData.interests.length > 0 && (
							<div className="mb-6">
								<h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
								<div className="flex flex-wrap gap-2">
									{userData.interests.map((tag, index) => (
										<span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm capitalize">
											{tag}
										</span>
									))}
								</div>
							</div>
						)}

						<p className="text-sm">{userData.bio}</p>

						<div className="flex justify-between items-center w-full mt-6">
							<div className="flex gap-6">
								<div onClick={toggleLike} className="cursor-pointer">
									{userData.profile_photo &&
										userData.liked_by_user ? (
											<RiHeart3Fill className="text-red-500" size={32} />
										) : (
											<RiHeart3Line size={32} />
									)}
								</div>

								{userData.liked_by_user && userData.liked_by_other && (
									<Link to={`/chat`}>
										<FiMessageSquare className="cursor-pointer" onClick={() => createChat(userData.id)} size={32} />
									</Link>
								)}

								<div onClick={toggleBlock} className="cursor-pointer">
									<MdBlockFlipped className={userData.blocked_by_user ? "text-red-500" : ""} size={32} />
								</div>
							</div>

							<button onClick={toggleReport} className="text-xs flex items-center gap-2 border p-2 rounded cursor-pointer">
								<FiAlertTriangle size={20} />
								<span>{userData.reported_by_user ? "Undo Report" : "Report fake profile"}</span>
							</button>
						</div>
					</div>
				</div>
			) : (
				<div>User not found</div>
			)}
		</div>
	);
};
