import { findUserReported } from "../models/reportModel.js";

export const getReportUsers = async (req, res) => {
	try {
		const currentUserId = req.session.userId;
		if (!currentUserId)
			return res.status(400).json({ error: "can not find user" });

		const reportedUsers = await findUserReported(currentUserId);
		return res.json(reportedUsers);
	} catch (error) {
		console.error("error getting blocked users:", error);
		return res.status(500).json({ error: "server error" });
	}
};
