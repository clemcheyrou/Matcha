import {
	getAllEvents,
	getEventById,
	createEvent,
	getUserEvents,
	createUserEvent,
} from "../models/eventModel.js";

export const getAllEventsController = async (req, res) => {
	try {
		const events = await getAllEvents();
		res.status(200).json(events);
	} catch (err) {
		res.status(500).json({ error: "server error" });
	}
};

export const getEventByIdController = async (req, res) => {
	const { id } = req.params;
	try {
		const event = await getEventById(id);
		if (!event) {
			return res.status(404).json({ error: "event not found" });
		}
		res.status(200).json(event);
	} catch (err) {
		res.status(500).json({ error: "server error" });
	}
};

export const createEventController = async (req, res) => {
	const { title, date, user_id } = req.body;
	try {
		const newEvent = await createEvent(title, date, user_id);
		res.status(201).json(newEvent);
	} catch (err) {
		res.status(500).json({ error: "server error" });
	}
};

export const getUserEventsController = async (req, res) => {
	const userId = req.session.userId;

	try {
		const userEvents = await getUserEvents(userId);
		res.status(200).json(userEvents);
	} catch (err) {
		res.status(500).json({ error: "server error" });
	}
};

export const createUserEventController = async (req, res) => {
	const { user_id, event_id, invitation_status } = req.body;
	try {
		const newUserEvent = await createUserEvent(
			user_id,
			event_id,
			invitation_status
		);
		res.status(201).json(newUserEvent);
	} catch (err) {
		res.status(500).json({ error: "server error" });
	}
};

export const createEventAndInviteUserController = async (req, res) => {
	const currentUserId = req.session.userId;
	const { title, date, chat_id } = req.body;

	try {
		const result = await pool.query(
			`SELECT user_1_id, user_2_id FROM chat WHERE id = $1`,
			[chat_id]
		);

		const conversation = result.rows[0];
		const user2Id =
			conversation.user_1_id === currentUserId
				? conversation.user_2_id
				: conversation.user_1_id;
		const newEvent = await createEvent(title, date, currentUserId);

		const userEvent = await createUserEvent(
			user2Id,
			newEvent.id,
			"pending"
		);

		res.status(201).json({
			message: "event created and user invited successfully.",
			event: newEvent,
			userEvent,
		});
	} catch (err) {
		res.status(500).json({error: "error creating event and inviting user."});
	}
};

export const respondToEventInvitationController = async (req, res) => {
	const { userId, eventId, response } = req.body;
  
	try {
	  const result = await pool.query(
		`UPDATE user_events SET invitation_status = $1 WHERE event_id = $2 AND user_id = $3 RETURNING *`,
		[response, eventId, userId]
	  );
  
	  if (result.rows.length > 0) {
		const event = result.rows[0];
		const eventCreatorId = event.user_id;
		io.emit("invitation_response", {
		  userId: eventCreatorId,
		  eventId,
		  response,
		  message: `User has ${response} your invitation.`,
		});
  
		io.emit("invitation_response", {
		  userId,
		  eventId,
		  response,
		  message: `you have ${response} the event invitation`,
		});
  
		res.status(200).json({
		  message: `invitation ${response} successfully`,
		});
	  } else {
		res.status(404).json({ error: "invitation not found." });
	  }
	} catch (err) {
	  res.status(500).json({ error: "error responding to event invitation."});
	}
};
