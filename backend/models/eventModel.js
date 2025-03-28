import pool from "../utils/db.js";

export const getAllEvents = async () => {
	const query = "SELECT * FROM events ORDER BY date";
	const result = await pool.query(query);
	return result.rows;
};

export const getEventById = async (id) => {
	const query = "SELECT * FROM events WHERE id = $1";
	const result = await pool.query(query, [id]);
	return result.rows[0];
};

export const createEvent = async (title, date, user_id, time) => {
	const query =
		"INSERT INTO events (title, date, user_id, heure) VALUES ($1, $2, $3, $4) RETURNING *";
	const result = await pool.query(query, [title, date, user_id, time]);
	return result.rows[0];
};

export const getUserEvents = async (user_id) => {
    const query = `
        SELECT 
            ue.id AS user_event_id,
            ue.user_id,
            ue.event_id,
            ue.invitation_status,
            e.id AS event_id,
            e.title,
            e.date,
            e.heure,
            e.created_at AS event_created_at
        FROM 
            user_events ue
        JOIN 
            events e ON ue.event_id = e.id
        WHERE 
            ue.user_id = $1;
    `;
	const result = await pool.query(query, [user_id]);
	return result.rows;
};

export const createUserEvent = async (user_id, event_id, invitation_status) => {
	const query =
		"INSERT INTO user_events (user_id, event_id, invitation_status) VALUES ($1, $2, $3) RETURNING *";
	const result = await pool.query(query, [
		user_id,
		event_id,
		invitation_status,
	]);
	console.log("Invitation créée :", result.rows[0]);
	return result.rows[0];
};

export const getUserInvitations = async (userId) => {
	const query = `
        SELECT e.id, e.title, e.date, ue.invitation_status, e.heure
        FROM events e
        JOIN user_events ue ON e.id = ue.event_id
        WHERE ue.user_id = $1 AND ue.invitation_status = 'pending'
        AND e.user_id != $1
		ORDER BY e.date;
    `;
	const result = await pool.query(query, [userId]);
	return result.rows;
};
