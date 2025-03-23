import { users } from '../index.js';
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
			console.error("id profile view:", viewedUserId);
        } catch (error) {
			console.error("error profile view:", error);
        }
		const user = await getUserById(userId);
		const name = user.name;
		
		await createNotification(viewedUserId, 'view', userId, `${name} see your profile!`);
		socket.to(viewedUserSocketId).emit('notification', `${name} see your profile`)
	}
	)
}
