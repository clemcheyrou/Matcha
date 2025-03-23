import pool from "../utils/db.js";

export const blockUser = async (userblockedId, userId) => {
	const query = `
        INSERT INTO blocks (blocked_user_id, user_id)
        VALUES ($1, $2)
        RETURNING *;
    `;
	const values = [userblockedId, userId];
	const result = await pool.query(query, values);
	return result.rows[0];
};

export const unblockUser = async (userblockedId, userId) => {
	const query = `
        DELETE FROM blocks
        WHERE blocked_user_id = $1 AND user_id = $2
        RETURNING *;
    `;
	const values = [userblockedId, userId];
	const result = await pool.query(query, values);

	return result.rows[0];
};

export const findUserBlocked = async (userId) => {
	const query = `
    SELECT 
		u.id, 
		u.name, 
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
    	blocks b ON b.user_id = $1 AND b.blocked_user_id = u.id
    WHERE 
    	b.blocked_user_id IS NOT NULL
  `;
	const result = await pool.query(query, [userId]);
	return result.rows;
};
