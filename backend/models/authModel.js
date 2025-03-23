import pool from "../utils/db.js";

export const updateUserPassword = async (userId, hashedPassword) => {
    try {
        const query = `
            UPDATE users 
            SET password = $1 
            WHERE id = $2 
            RETURNING id
        `;
        
        const values = [hashedPassword, userId];
        
        const result = await pool.query(query, values);
        
        if (result.rowCount === 0)
            throw new Error('user not found');
        return result.rows[0].id;
    } catch (err) {
        throw err;
    }
};