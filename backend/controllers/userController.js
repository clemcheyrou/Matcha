import {
	createLocation,
	getAllUsersLocations,
} from "../models/locationModel.js";
import {
	getUserById,
	getAllUsers,
	getAllUserPhotos,
	addUserGender,
	findPhotoByIdAndUser,
	deletePhotoByIdAndUser,
	findNextUserPhoto,
	updateUserProfilePhoto,
	updateOrientation,
	updateInterests,
	updateGenderBio,
	updateUserProfile,
	deleteUser,
} from "../models/userModel.js";
import { validationResult } from "express-validator";

export const getAllUsersController = async (req, res) => {
	try {
		const users = await getAllUsers();

		if (users.length > 0) {
			return res.status(200).json(users);
		} else {
			return res.status(404).json({ message: "no users found" });
		}
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ message: "error fetching the users" });
	}
};

export const getProfile = async (req, res) => {
	const userId = req.session.userId;
	try {
		const user = await getUserById(userId);
		res.status(200).json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "server error" });
	}
};

export const getUserProfile = async (req, res) => {
	const id = req.session.userId;
	try {
		const { userId } = req.params;
		const user = await getUserById(userId, id);
		res.status(200).json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "server error" });
	}
};

export const addGender = async (req, res) => {
	try {
		const userId = req.session.userId;
		if (!userId) {
			return res
				.status(401)
				.json({ message: "user not authenticated" });
		}
		const gender = await addUserGender(userId);
		res.status(200).json({
			message: `gender: ${gender}`,
		});
	} catch (error) {
		res.status(500).json({ message: "server error" });
	}
};

export const getPhotos = async (req, res) => {
	try {
		const userId = req.session.userId;

		if (!userId) {
			return res
				.status(401)
				.json({ message: "user not authenticated" });
		}

		const userPhotos = await getAllUserPhotos(userId);

		if (!userPhotos || userPhotos.length === 0)
			return res.status(200).json({message: "no photos"});

		return res.status(200).json({
			photos: userPhotos,
		});
	} catch (error) {
		res.status(500).json({ message: "server error" });
	}
};

export const deletePhoto = async (req, res) => {
	const { photoId } = req.params;
	const userId = req.session.userId;

	try {
		const photo = await findPhotoByIdAndUser(photoId, userId);

		if (!photo) {
			return res.status(404).json({
				message: "error to find photo",
			});
		}

		await deletePhotoByIdAndUser(photoId, userId);

		if (photo.type === "profil") {
			const nextPhotoId = await findNextUserPhoto(userId);
			await updateUserProfilePhoto(userId, nextPhotoId);
		}

		return res
			.status(200)
			.json({ message: "photo deleted" });
	} catch (err) {
		return res.status(500).json({message: "server error to delete photo"});
	}
};

export const saveGenderBio = async (req, res) => {
	const { gender, bio, age } = req.body;
	const userId = req.session.userId;

	if (!gender || !bio) {
		return res.status(400).json({ message: "all fields are required" });
	}

	if (!userId) {
		return res.status(401).json({ message: "user not authenticated" });
	}

	try {
		const updatedUser = await updateGenderBio(userId, gender, bio, age);
		res.status(200).json({
			message: "data updated successfuly",
			data: updatedUser,
		});
	} catch (error) {
		res.status(500).json({ message: "server error" });
	}
};

export const saveOrientation = async (req, res) => {
	const { orientation } = req.body;
	const userId = req.session.userId;

	try {
		await updateOrientation(userId, orientation);
		res.status(200).json({
			message: "orientation saved",
		});
	} catch (error) {
		res.status(500).json({ message: "server error" });
	}
};

export const saveInterests = async (req, res) => {
	const { interests } = req.body;
	const userId = req.session.userId;

	if (!userId) return res.status(400).json({ message: "user not found" });

	try {
		await updateInterests(userId, interests);
		res.status(200).json({ message: "interest saved" });
	} catch (error) {
		res.status(500).json({ message: "server error" });
	}
};

export const deleteUserController = async (req, res) => {
	try {
		const { id } = req.params;
		const success = await deleteUser(id);

		if (success) {
			return res.status(200).json({ message: "user deleted" });
		} else {
			return res.status(404).json({ message: "user not found" });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "server error" });
	}
};

export const updateUserProfileController = async (req, res) => {
	const currentUserId = req.session.userId;
	const updates = req.body;

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		const updatedUser = await updateUserProfile(currentUserId, updates);
		res.status(200).json(updatedUser);
	} catch (error) {
		res.status(500).json({error: "error updating user profile"});
	}
};

export const createLocationForUserController = async (req, res) => {
	const currentUserId = req.session.userId;
	const { lat, lng } = req.body;
	if (!currentUserId || lat === undefined || lng === undefined) {
		return res
			.status(400)
			.json({ error: "currentUserId, lat and lng are required" });
	}

	try {
		const newLocation = await createLocation(currentUserId, lat, lng);
		res.status(201).json({
			message: "success location",
			location: newLocation,
		});
	} catch (error) {
		res.status(500).json({ error: "error" });
	}
};

export const getAllUserLocationsController = async (req, res) => {
	const currentUserId = req.session.userId;
	if (!currentUserId)
		return res.status(400).json({ message: "can't find user" });

	try {
		const user = await getUserById(currentUserId);
		const { gender, orientation } = user;

		let genderPreference = null;
		if (orientation === 0) {
			genderPreference = gender === "Man" ? "Woman" : "Man";
		} else if (orientation === 1) {
			genderPreference = gender;
		}
		const locations = await getAllUsersLocations(
			currentUserId,
			genderPreference
		);

		res.status(200).json({ data: locations });
	} catch (error) {
		res.status(500).json({ error: "error" });
	}
};
