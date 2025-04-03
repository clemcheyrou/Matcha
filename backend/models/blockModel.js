import pool from "../utils/db.js";

export const blockUser = async (userblockedId, userId) => {
	const deleteQuery = `
		DELETE FROM chat
		WHERE (user_1_id = $1 AND user_2_id = $2)
		OR (user_1_id = $2 AND user_2_id = $1);
	`;
	const deleteValues = [userId, userblockedId];
	await pool.query(deleteQuery, deleteValues);

	const deleteLikeQuery = 
	`DELETE FROM likes
	WHERE (user_id = $1 AND liked_user_id = $2) 
	OR (user_id = $2 AND liked_user_id = $1);`;
	const deleteLikeValues = [userId, userblockedId];
	await pool.query(deleteLikeQuery, deleteLikeValues);

	const deleteMatchQuery = `
	DELETE FROM matches
	WHERE (user_1_id = $1 AND user_2_id = $2)
	OR (user_1_id = $2 AND user_2_id = $1);
	`;
	const deleteMatchValues = [userId, userblockedId];
	await pool.query(deleteMatchQuery, deleteMatchValues);

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

export const hasBlocked = async (userId, targetUserId) => {
    const query = `
        SELECT 1
        FROM blocks
        WHERE user_id = $1 AND blocked_user_id = $2
        LIMIT 1;
    `;
    const values = [userId, targetUserId];
    const result = await pool.query(query, values);
    
    return result.rowCount > 0;
};