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

export const createEvent = async (title, date, user_id) => {
	const query = "INSERT INTO events (title, date, user_id) VALUES ($1, $2, $3) RETURNING *";
	const result = await pool.query(query, [title, date, user_id]);
	return result.rows[0];
};

export const getUserEvents = async (user_id) => {
	const query = 'SELECT * FROM user_events WHERE user_id = $1';
	const result = await pool.query(query, [user_id]);
	return result.rows;
};

export const createUserEvent = async (user_id, event_id, invitation_status) => {
	const query = 'INSERT INTO user_events (user_id, event_id, invitation_status) VALUES ($1, $2, $3) RETURNING *';
	const result = await pool.query(query, [user_id, event_id, invitation_status]);
	return result.rows[0];
};