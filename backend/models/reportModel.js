import pool from "../utils/db.js";

export const reportUser = async (userReportedId, userId) => {
	const query = `
        INSERT INTO reports (reported_user_id, user_id)
        VALUES ($1, $2)
        RETURNING *;
    `;
	const values = [userReportedId, userId];
	const result = await pool.query(query, values);
	return result.rows[0];
};

export const unreportUser = async (userReportedId, userId) => {
	const query = `
        DELETE FROM reports
        WHERE reported_user_id = $1 AND user_id = $2
        RETURNING *;
    `;
	const values = [userReportedId, userId];
	const result = await pool.query(query, values);

	return result.rows[0];
};

export const findUserReported = async (userId) => {
	const query = `
    SELECT 
		u.id, 
		u.username,
		u.firstname, 
		u.lastname, 
		u.age, 
		u.gender, 
		u.bio, 
		u.interests, 
		p.url AS profile_photo
    FROM 
    	users u
    LEFT JOIN 
    	photos p ON u.profile_photo_id = p.id
    LEFT JOIN 
    	reports r ON r.user_id = $1 AND r.reported_user_id = u.id
    WHERE 
    	r.reported_user_id IS NOT NULL
  `;
	const result = await pool.query(query, [userId]);
	return result.rows;
};
