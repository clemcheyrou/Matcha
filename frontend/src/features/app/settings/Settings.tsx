import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import {
	fetchUser,
	updateUserProfile,
} from "../../../store/slice/authSlice.ts";
import { addPhoto, fetchPhotos } from "../../../store/slice/photosSlice.ts";
import { PhotoGrid } from "../../onboarding/step1/PhotoGrid.tsx";
import { PhotoPopin } from "../../onboarding/step1/PhotoPopin.tsx";

const TABS = [
	{ key: "profile" as const, label: "Profile" },
	{ key: "photos" as const, label: "Photos" },
  ];

export const Settings: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const user = useSelector((state: RootState) => state.auth.user);

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [gender, setGender] = useState("");
	const [sexualPreference, setSexualPreference] = useState<
		number | undefined
	>();
	const [biography, setBiography] = useState("");
	const [interests, setInterests] = useState<string[]>([]);
	const [profilePicture] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { photos } = useSelector((state: RootState) => state.photos);
	const [isPopinOpen, setIsPopinOpen] = useState(false);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [tab, setTab] = useState<string>("profile");

	const handleOpenPopin = () => {
		setIsPopinOpen(true);
	};

	const handleClosePopin = () => {
		setIsPopinOpen(false);
		setPreviewImage(null);
		setFile(null);
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0];
		if (selectedFile) {
			setFile(selectedFile);
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewImage(reader.result as string);
			};
			reader.readAsDataURL(selectedFile);
		}
	};

	const handleAddPhoto = async () => {
		if (file) {
			try {
				await dispatch(addPhoto(file));
				dispatch(fetchPhotos());
				handleClosePopin();
			} catch (error) {
				console.error("error to add photo:", error);
			}
		}
	};

	useEffect(() => {
		dispatch(fetchPhotos());
	}, [dispatch]);

	useEffect(() => {
		if (user) {
			setName(user.name);
			setEmail(user.email);
			setGender(user.gender || "");
			setSexualPreference(user.orientation || undefined);
			setBiography(user.bio || "");
			setInterests(user.interests || []);
		} else {
			dispatch(fetchUser());
		}
	}, [dispatch, user]);

	const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			if (profilePicture) {
				const photoUrl = await dispatch(
					addPhoto(profilePicture)
				).unwrap();
				const profileData = {
					name,
					email,
					gender,
					sexualPreference,
					biography,
					interests,
					profilePicture: photoUrl,
				};

				await dispatch(updateUserProfile(profileData)).unwrap();
			} else {
				const profileData = {
					name,
					email,
					gender,
					sexualPreference,
					biography,
					interests,
				};
				await dispatch(updateUserProfile(profileData)).unwrap();
			}
		} catch (err) {
			setError(err as string);
		} finally {
			setLoading(false);
		}
	};

	const renderTabs = () => {
		return (
			<ul className="flex w-full">
				{TABS.map(({ key, label }) => (
					<li
						key={key}
						className={`cursor-pointer py-2 w-1/2 text-center rounded-md transition-all duration-200 ${
							tab === key
								? "bg-white text-[#191919]"
								: "text-gray-400 hover:text-white"
						}`}
						onClick={() => setTab(key)}
					>
						{label}
					</li>
				))}
			</ul>
		);
	};

	return (
		<div className="p-6 rounded-lg shadow-md">
			<h1 className="text-3xl font-semibold mb-10">Edit Profile</h1>

			<div className="rounded bg-[#191919] flex-1 min-w-[150px] py-1 pl-1">
	            <ul className="flex space-x-2 font-agbalumo whitespace-nowrap">
	              {renderTabs()}
	            </ul>
          	</div>

			<div>
				{tab === "profile" && (
					<form onSubmit={handleProfileUpdate} className="space-y-4 mt-10">
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="First Name"
							required
							className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300 text-black"
						/>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Email"
							required
							className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300 text-black"
						/>
						<select
							value={gender}
							onChange={(e) => setGender(e.target.value)}
							className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300 text-black"
						>
							<option value="">Select Gender</option>
							<option value="Man">Man</option>
							<option value="Woman">Woman</option>
						</select>
						<textarea
							value={biography}
							onChange={(e) => setBiography(e.target.value)}
							placeholder="Biography"
							className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300 text-black"
						/>
						<input
							type="text"
							value={interests.join(", ")}
							onChange={(e) =>
								setInterests(
									e.target.value
										.split(",")
										.map((tag) => tag.trim())
								)
							}
							placeholder="Interests (comma-separated)"
							className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300 text-black"
						/>
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-pink text-white py-2 rounded-md hover:bg-pink-600 transition disabled:bg-gray-400"
						>
							{loading ? "Updating..." : "Update Profile"}
						</button>
						{error && (
							<p className="text-red-500 text-sm mt-2">{error}</p>
						)}
					</form>
				)}

				{tab === "photos" && (
					<div className="mt-2">
						<PhotoGrid
							photos={photos}
							onAddPhotoClick={handleOpenPopin}
						/>
						<PhotoPopin
							isPopinOpen={isPopinOpen}
							handleClosePopin={handleClosePopin}
							handleFileChange={handleFileChange}
							handleAddPhoto={handleAddPhoto}
							previewImage={previewImage}
						/>
					</div>
				)}
			</div>
		</div>
	);
};
