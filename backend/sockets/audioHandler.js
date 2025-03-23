import pool from "../utils/db.js";
import fs from "fs";
import path from "path";
import { users } from "../index.js";

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
				`SELECT user_1_id, user_2_id FROM chat WHERE id = $1`,
				[chat_id]
			);

			const conversation = result.rows[0];
			const user2Id =
				conversation.user_1_id === authorId
					? conversation.user_2_id
					: conversation.user_1_id;

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
					.emit("notification", "receive audio message");
			}

			socket.emit("messageSent", newMessage);
		} catch (err) {
			socket.emit("error", { message: "error sending message" });
		}
	});
};
