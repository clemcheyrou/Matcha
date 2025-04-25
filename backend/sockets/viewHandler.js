import { formatNotification } from '../controllers/notificationController.js';
import { users } from '../index.js';
import { hasBlocked } from '../models/blockModel.js';
import { createNotification } from '../models/notificationModel.js';
import { getUserById } from '../models/userModel.js';
import { logProfileView } from '../models/viewModel.js';

export const viewHandler = (socket) => {
	socket.on('viewProfile', async (viewedUserId) => { 
		const userId = socket.request.session.userId;
		const viewedUserSocketId = users[viewedUserId];
		if (!userId || userId === viewedUserId)
            return;
		try {
            const profileView = await logProfileView(userId, viewedUserId);
        } catch (error) {
			console.error("error profile view:", error);
        }
		const user = await getUserById(userId);
		const name = user.username;
		const likedUserBlocked = await hasBlocked(viewedUserId, userId);
		if (!likedUserBlocked) {
			await createNotification(viewedUserId, 'view', userId, `${name} see your profile!`);
			socket.to(viewedUserSocketId).emit('notification', formatNotification(`${name} see your profile`, userId, 'view'))
		}
	}
	)
}
