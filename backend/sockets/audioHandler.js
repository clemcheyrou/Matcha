import pool from "../utils/db.js";
import fs from "fs";
import path from "path";
import { users } from "../index.js";
import { createNotification } from "../models/notificationModel.js";
import { formatNotification } from "../controllers/notificationController.js";

export const audioHandler = (socket) => {
	socket.on("audio-message", async (message) => {
		const { chat_id, audio } = message;

		const authorId = socket.request.session.userId;

		const audioFileName = `audio-${Date.now()}.wav`;
		const audioPath = path.join("uploads", audioFileName);
		const buffer = Buffer.from(audio, "binary");
		fs.writeFileSync(audioPath, buffer);

		try {
			const insertResult = await pool.query(
				`INSERT INTO message (message, author_id, conversation_id, audio_path)
       			VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
				[null, authorId, chat_id, audioPath]
			);

			const result = await pool.query(
				`SELECT chat.*,
						u1.username AS user_1_name,
						u2.username AS user_2_name
				 FROM chat
				 LEFT JOIN users u1 ON chat.user_1_id = u1.id
				 LEFT JOIN users u2 ON chat.user_2_id = u2.id
				 WHERE chat.id = $1`,
				[chat_id]
			);

			const conversation = result.rows[0];
			const user2Id =
				conversation.user_1_id === authorId
					? conversation.user_2_id
					: conversation.user_1_id;
			const name = conversation.user_1_id == authorId ? conversation.user_2_name : conversation.user_1_name;

			const newMessage = {
				id: insertResult.rows[0].id,
				created_at: insertResult.rows[0].created_at,
				author_id: authorId,
				audio_path: audioPath,
			};

			const recipientSocketId = users[user2Id];
			if (recipientSocketId) {
				socket.to(recipientSocketId).emit("receiveMessage", newMessage);
				socket
					.to(recipientSocketId)
					.emit("notification", formatNotification(`Receive audio message from ${name}`, authorId, 'message'));
			}
			await createNotification(user2Id, 'message', authorId, `Receive audio message from ${name}`);
			socket.emit("audio-url", audioPath);
			socket.emit("messageSent", newMessage);
		} catch (err) {
			socket.emit("error", { message: "error sending message" });
		}
	});
};
