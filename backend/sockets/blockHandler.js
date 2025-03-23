import { users } from '../index.js';
import { blockUser, unblockUser } from '../models/blockModel.js';
import { getUserById } from '../models/userModel.js';

export const blockHandler = (socket) => {
    socket.on('block', async (blockedUserId) => {
        const userId = socket.request.session.userId;
        const blockedUserSocketId = users[blockedUserId];

        if (!userId || userId === blockedUserSocketId)
            return;

        try {
            await blockUser(blockedUserId, userId);
            const updatedProfile = await getUserById(blockedUserId, userId);
            socket.emit("profileUpdated", updatedProfile);
        } catch (error) {
            console.error("error:", error);
        }
    });

    socket.on('unblock', async (blockedUserId) => {
        const userId = socket.request.session.userId;
        const blockedUserSocketId = users[blockedUserId];

        if (!userId || userId === blockedUserSocketId)
            return;

        try {
            await unblockUser(blockedUserId, userId);
            const updatedProfile = await getUserById(blockedUserId, userId);
            socket.emit("profileUpdated", updatedProfile);
			socket.emit("unblocked", blockedUserId);
        } catch (error) {
            console.error("error:", error);
        }
    });
};
