import { getProfileViews } from "../models/viewModel.js";

export const getProfileViewsController = async (req, res) => {
	const currentUserId = req.session.userId;
	if (!currentUserId)
		return res.status(401).json({ message: "user not authenticated" });

	try {
		const views = await getProfileViews(currentUserId);
		if (views.length > 0) return res.status(200).json({ views });
		else return res.status(404).json({ message: "no profile views found" });
	} catch (error) {
		return res.status(500).json({ message: "server error" });
	}
};
