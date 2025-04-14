import {
	getUserById,
	findUsersByPreference,
	findUsersInMatch,
	findDefaultUsers,
	getAllLikes,
} from "../models/userModel.js";
import pool from "../utils/db.js";

export const discoverNewUsers = async (req, res) => {
	const userId = req.session.userId;
	try {
		const user = await getUserById(userId);
		if (!user) {
			return res.status(404).json({ error: "user not found" });
		}

		const { gender, orientation } = user;
		let genderPreference = null;

		if (orientation === 0)
			genderPreference = gender === "Man" ? "Woman" : "Man";
		else if (orientation === 1)
			genderPreference = gender === "Man" ? "Man" : "Woman";
		else if (orientation === 2)
			genderPreference = 'All';

		const { sortBy, ageMin, ageMax, locationMin, locationMax, fameMin, fameMax, tags } = req.query;

		const filters = {
			genderPreference,
			sortBy,
			ageRange: [ageMin ? Number(ageMin) : null, ageMax ? Number(ageMax) : null],
			locationRange: [locationMin ? Number(locationMin) : null, locationMax ? Number(locationMax) : null],
			fameRange: [fameMin ? Number(fameMin) : null, fameMax ? Number(fameMax) : null],
			tags: tags ? tags.split(',') : [],
		};

		const users = await findUsersByPreference(userId, filters);
		res.json(users);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "server error" });
	}
};

export const getMatchedUsers = async (req, res) => {
	const userId = req.session.userId;

	try {
		if (!userId) {
			return res.status(401).json({ error: "user not authenticated" });
		}

		const matchedUsers = await findUsersInMatch(userId);

		if (matchedUsers.length === 0) {
			return res.json([]);
		}

		res.json(matchedUsers);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "server error" });
	}
};

export const getLikeUsers = async (req, res) => {
	try {
		const listLikeUsers = await getAllLikes();

		if (listLikeUsers.length === 0) {
			return res.status(404).json({ message: "no likes found" });
		}

		res.json(listLikeUsers);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "server error" });
	}
};
