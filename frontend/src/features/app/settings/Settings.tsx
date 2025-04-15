import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import {
	fetchUser,
	updateUserProfile,
} from "../../../store/slice/authSlice.ts";
import { addPhoto, fetchPhotos } from "../../../store/slice/photosSlice.ts";
import { PhotoGrid } from "../../onboarding/step1/PhotoGrid.tsx";
import { PhotoPopin } from "../../onboarding/step1/PhotoPopin.tsx";

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

const TABS = [
	{ key: "profile" as const, label: "Profile" },
	{ key: "photos" as const, label: "Photos" },
  ];

 const orientationOptions = [
	{ value: 0, label: "Heterosexual" },
	{ value: 1, label: "Homosexual" },
	{ value: 2, label: "Bisexual" },
]; 

const sanitizeInput = (input: string) => {
	return input
	  .replace(/<script.*?>.*?<\/script>/gi, "")
	  .replace(/<\/?[^>]+(>|$)/g, "")
	  .trim();
  };

export const Settings: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const user = useSelector((state: RootState) => state.auth.user);

	const [firstname, setFirstname] = useState("");
	const [lastname, setLastname] = useState("");
	const [email, setEmail] = useState("");
	const [gender, setGender] = useState("");
	const [age, setAge] = useState<number | undefined>();
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

	useMemo(() => {
		if (user) {
			setFirstname(user.firstname);
			setLastname(user.lastname);
			setEmail(user.email);
			setAge(user.age || undefined);
			setGender(user.gender || "");
			setSexualPreference(user.orientation || 0);
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
					firstname,
					lastname,
					email,
					gender,
					age,
					sexualPreference,
					biography: sanitizeInput(biography),
					interests,
					profilePicture: photoUrl,
				};

				await dispatch(updateUserProfile(profileData)).unwrap();
			} else {
				const profileData = {
					firstname,
					lastname,
					email,
					gender,
					age,
					sexualPreference,
					biography: sanitizeInput(biography),
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
		<div className="p-6 rounded-lg shadow-md overflow-y-auto max-h-[80vh]">
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
							value={firstname}
							onChange={(e) => setFirstname(e.target.value)}
							placeholder="Firstname"
							required
							className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300 text-black"
						/>
						<input
							type="text"
							value={lastname}
							onChange={(e) => setLastname(e.target.value)}
							placeholder="Lastname"
							required
							className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300 text-black"
						/>
						{ user && user.auth_type === 'local' &&
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Email"
								required
								className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300 text-black"
							/>
						}
						<input
							type="number"
							value={age}
							onChange={(e) => setAge(e.target.value === "" ? undefined : Number(e.target.value))}
							placeholder="Age"
							min={18}
							max={100}
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
						<select
							value={sexualPreference}
							onChange={(e) =>
								setSexualPreference(e.target.value === "" ? undefined : Number(e.target.value))
							}
							className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300 text-black"
						>
							<option value="">Select Orientation</option>
							{orientationOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<textarea
							value={biography}
							onChange={(e) => setBiography(e.target.value)}
							placeholder="Biography"
							className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300 text-black"
						/>
						<div>
							<label className="block mb-2">Interests</label>
							<div className="flex flex-wrap gap-2">
								{interestsList.map((interest) => (
									<div
										key={interest}
										onClick={() => {
											setInterests((prev) =>
												prev.includes(interest)
													? prev.filter((i) => i !== interest)
													: [...prev, interest]
											);
										}}
										className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-all
											${
												interests.includes(interest)
													? "bg-pink text-white"
													: "border text-white hover:bg-gray-300 hover:text-black"
											}`}
									>
										{interest}
									</div>
								))}
							</div>
						</div>
						<button
							type="submit"
							disabled={loading || interests.length < 1 || biography.length === 0}
							className={`w-full py-2 rounded-md transition ${
								interests.length < 1 || biography.length === 0 || loading
									? "bg-gray-400 cursor-not-allowed"
									: "bg-pink text-white hover:bg-pink-600"
							}`}						
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
