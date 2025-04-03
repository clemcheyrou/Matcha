import { formatNotification } from "../controllers/notificationController.js";
import { users } from "../index.js";
import { hasBlocked } from "../models/blockModel.js";
import { createNotification } from "../models/notificationModel.js";
import { getUserById } from "../models/userModel.js";
import pool from "../utils/db.js";

export const likeHandler = (socket) => {
	socket.on("like", async (likedUserId) => {
		const userId = socket.request.session.userId;

		if (!userId) {
			console.log("not authenticated");
			return;
		}
		const client = await pool.connect();
		try {
			await client.query("BEGIN");
			await client.query(
				`INSERT INTO likes (user_id, liked_user_id) 
				 VALUES ($1, $2) 
				 ON CONFLICT (user_id, liked_user_id) DO NOTHING`,
				[userId, likedUserId]
			);
			const { rowCount } = await client.query(
				`SELECT 1 FROM likes WHERE user_id = $1 AND liked_user_id = $2`,
				[likedUserId, userId]
			);

			if (rowCount > 0)
				await handleMatch(client, userId, likedUserId);
			else
				notifyLike(userId, likedUserId);

			await client.query("COMMIT");
			const updatedProfile = await getUserById(likedUserId, userId);
			socket.emit("profileUpdated", updatedProfile);
			socket.emit("like", likedUserId);
		} catch (error) {
			await client.query("ROLLBACK");
			console.error("error:", error);
		} finally {
			client.release();
		}
	});

	async function handleMatch(client, userId, likedUserId) {
		await client.query(
			`
				INSERT INTO matches (user_1_id, user_2_id)
				VALUES (LEAST($1::integer, $2::integer), GREATEST($1::integer, $2::integer))
				ON CONFLICT (user_1_id, user_2_id) DO NOTHING;
			`,
			[userId, likedUserId]
		);

		const likedUserSocketId = users[likedUserId];
		const user = await getUserById(userId);
		const name = user.name;
		const userLiked = await getUserById(likedUserId);
		const nameLiked = userLiked.name;

		await createNotification(likedUserId, 'unlike', userId, `You and ${nameLiked} are now a match`);
		await createNotification(userId, 'unlike', likedUserId, `You and ${name} are now a match`);
		socket.emit("notification", formatNotification(`You and ${nameLiked} are now a match`, userId, 'unlike'));
		const updatedMatch = await getUserById(likedUserId, userId);
		socket.emit("match", updatedMatch);
		const updatedUnMatch2 = await getUserById(userId, likedUserId);
		socket.to(likedUserSocketId).emit("match", updatedUnMatch2);
		socket
			.to(likedUserSocketId)
			.emit("notification", formatNotification(`You and ${name} are now a match`, userId, 'unlike'));
	}

	async function notifyLike(userId, likedUserId) {
		const likedUserSocketId = users[likedUserId];
		const user = await getUserById(userId);
		const name = user.name;

		const likedUserBlocked = await hasBlocked(likedUserId, userId);
		if (!likedUserBlocked) {
			await createNotification(likedUserId, "like", userId,`${name} likes you!`);
			socket.to(likedUserSocketId).emit("notification", formatNotification(`${name} likes you!`, userId, 'like'));
			socket.to(likedUserSocketId).emit("receiveLike", userId);
		}
	}

	socket.on("unlike", async (likedUserId) => {
		const userId = socket.request.session.userId;

		if (!userId) return console.log("not authenticated");

		const client = await pool.connect();

		try {
			await client.query("BEGIN");

			await client.query(
				`DELETE FROM likes WHERE user_id = $1 AND liked_user_id = $2`,
				[userId, likedUserId]
			);

			const deleteQuery = `
				DELETE FROM chat
				WHERE (user_1_id = $1 AND user_2_id = $2)
				OR (user_1_id = $2 AND user_2_id = $1);
			`;
			const deleteValues = [userId, likedUserId];
			await client.query(deleteQuery, deleteValues);

			const { rowCount } = await client.query(
				`DELETE FROM matches 
			 	WHERE (user_1_id = $1 AND user_2_id = $2) 
				OR (user_1_id = $2 AND user_2_id = $1)`,
				[userId, likedUserId]
			);

			await client.query("COMMIT");

			handleUnlike(userId, likedUserId, rowCount > 0);
			const updatedProfile = await getUserById(likedUserId, userId);
			socket.emit("profileUpdated", updatedProfile);
			socket.emit("unlike", likedUserId);
			socket.to(users[likedUserId]).emit("profileUpdated", updatedProfile);
		} catch (error) {
			await client.query("ROLLBACK");
			console.error("error processing unlike:", error);
		} finally {
			client.release();
		}
	});

	async function handleUnlike(userId, likedUserId, wasMatched) {
		const likedUserSocketId = users[likedUserId];
		const user = await getUserById(userId, likedUserId);
		const name = user.name;
		const likedUserBlocked = await hasBlocked(likedUserId, userId);

		if (!likedUserBlocked) {
			await createNotification(likedUserId, "unlike" ,userId,`${name} unlikes you!`);
			socket.to(likedUserSocketId).emit('notification', formatNotification(`${name} unlikes you!`, userId, 'like'));
			socket.to(likedUserSocketId).emit("receiveUnLike", userId);
		}

		if (wasMatched) {
			const updatedUnMatch = await getUserById(likedUserId, userId);
			socket.emit("unmatch", updatedUnMatch);
			const updatedUnMatch2 = await getUserById(userId, likedUserId);
			socket.to(likedUserSocketId).emit("unmatch", updatedUnMatch2);
		}
	}
};