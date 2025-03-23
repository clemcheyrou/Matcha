import { users } from '../index.js';
import { reportUser, unreportUser } from '../models/reportModel.js';
import { getUserById } from '../models/userModel.js';

export const reportHandler = (socket) => {
	socket.on('report', async (reportedUserId) => {
		const userId = socket.request.session.userId;
		const reportedUserSocketId = users[reportedUserId];

		if (!userId || userId === reportedUserSocketId)
			return;

		try {
			await reportUser(reportedUserId, userId);
			const updatedProfile = await getUserById(reportedUserId, userId);
			socket.emit("profileUpdated", updatedProfile);
		} catch (error) {
			console.error("error:", error);
		}
	});

	socket.on('unreport', async (reportedUserId) => {
		const userId = socket.request.session.userId;
		const reportedUserSocketId = users[reportedUserId];

		if (!userId || userId === reportedUserSocketId)
			return;

		try {
			await unreportUser(reportedUserId, userId);
			const updatedProfile = await getUserById(reportedUserId, userId);
			socket.emit("profileUpdated", updatedProfile);
			socket.emit("unreported", reportedUserId);
		} catch (error) {
			console.error("error:", error);
		}
	});
};
