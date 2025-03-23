import { findUserBlocked } from "../models/blockModel.js";

export const getBlockedUsers = async (req, res) => {
	try {
		const currentUserId = req.session.userId;
		if (!currentUserId)
			return res.status(400).json({ error: "can not find user" });

		const blockedUsers = await findUserBlocked(currentUserId);
		return res.json(blockedUsers);
	} catch (error) {
		return res.status(500).json({ error: "server error" });
	}
};
