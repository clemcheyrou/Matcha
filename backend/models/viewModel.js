import pool from "../utils/db.js";

export const logProfileView = async (viewerId, userId) => {
    const query = `
        INSERT INTO profile_views (viewer_id, user_id)
        VALUES ($1, $2)
        RETURNING *;
    `;
    const values = [viewerId, userId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const getProfileViews = async (userId) => {
    const query = `
        SELECT 
            pv.id, 
            pv.viewer_id, 
            pv.created_at,
            u.name AS viewer_name
        FROM 
            profile_views pv
        JOIN 
            users u ON pv.viewer_id = u.id
        WHERE 
            pv.user_id = $1
        ORDER BY 
            pv.created_at DESC;
    `;
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows;
};