import pool from "../utils/db.js";

export const createNotification = async (userId, type, senderId, message) => {
    const query = `
        INSERT INTO notifications (user_id, type, sender_id, message) 
        VALUES ($1, $2, $3, $4)
    `;
    return pool.query(query, [userId, type, senderId, message]);
};

export const getNotifications = async (userId) => {
    const query = `
        SELECT * FROM notifications 
        WHERE user_id = $1 
        ORDER BY created_at DESC
    `;
    return pool.query(query, [userId]).then(res => res.rows);
};

export const markAsRead = async (notificationId) => {
    const query = `
        UPDATE notifications
        SET is_read = true
        WHERE id = $1
        RETURNING *
    `;
    return pool.query(query, [notificationId]).then(res => res.rows[0]);
};
