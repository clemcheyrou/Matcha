import pool from "../utils/db.js";
import { users } from "../index.js";
import { createEvent, createUserEvent } from "../models/eventModel.js";
import { createNotification } from "../models/notificationModel.js";
import { getUserOtherId } from "../models/chatModel.js";
import { formatNotification } from "../controllers/notificationController.js";

export const eventHandler = (socket) => {
	socket.on("create-event-and-invite", async (message) => {
		const currentUserId = socket.request.session.userId;
		const { title, date, chat_id } = message;

		try {
			const otherUserId = await getUserOtherId(chat_id, currentUserId);
			const newEvent = await createEvent(title, date, currentUserId);

			await createUserEvent(otherUserId, newEvent.id, "pending");

			const otherSocketId = users[otherUserId];
			const newDate = new Date(date);
			const day = newDate.getUTCDate();
			const month = newDate.getUTCMonth() + 1;
			const year = newDate.getUTCFullYear();
			
			const formattedDate = `${day < 10 ? '0' : ''}${day}/${month < 10 ? '0' : ''}${month}/${year}`;
			await createNotification(otherUserId, "event", currentUserId, `Meet up ${otherUserId} : ${formattedDate}`);
			socket.to(otherSocketId).emit("notification", formatNotification(`${otherUserId} want to see you.`, currentUserId, 'event'));
		} catch (err) {
			socket.emit("error", { message: "error creating event." });
		}
	});
	socket.on("invitation-response", async (data) => {
		const { invitationId, accepted } = data;
		const userId = socket.request.session.userId;

		try {
			const eventResult = await pool.query(
				`SELECT * FROM user_events WHERE event_id = $1 AND user_id = $2`,
				[invitationId, userId]
			);

			if (eventResult.rowCount === 0) return socket.emit("error", {message: "Invitation not found."});

			const updatedStatus = accepted ? "accepted" : "rejected";
			await pool.query(
				`UPDATE user_events SET invitation_status = $1 WHERE event_id = $2 AND user_id = $3`,
				[updatedStatus, invitationId, userId]
			);

			const eventOwnerResult = await pool.query(
				`SELECT created_by FROM events WHERE id = $1`,
				[invitationId]
			);
			const creatorId = eventOwnerResult.rows[0].created_by;

			const recipientSocketId = users[creatorId];

			if (recipientSocketId)
				socket.to(recipientSocketId).emit("notification", formatNotification(`User ${userId} has ${updatedStatus} your event invitation.`, userId,'event'));
		} catch (error) {
			socket.emit("error", {
				message: "error responding to invitation.",
			});
		}
	});
};
