import pool from "../utils/db.js";

export const checkChat = async (userId1, userId2) => {
	const query = `
		SELECT id FROM chat
		WHERE (user_1_id = $1 AND user_2_id = $2)
		OR (user_2_id = $1 AND user_1_id = $2)
	`;

	const { rows } = await pool.query(query, [userId1, userId2]);
	return rows;
};

export const addNewChat = async (userId1, userId2) => {
	const query = `
		INSERT INTO chat (user_1_id, user_2_id)
		VALUES ($1, $2)
		RETURNING id
	`;

	const result = await pool.query(query, [userId1, userId2]);
	return result.rows[0].id;
};

export const getAllChats = async (userId) => {
	const query = `
		SELECT chat.*,
			u1.username AS user_1_name,
			u2.username AS user_2_name,
			p1.url AS user_1_profile_photo,
			p2.url AS user_2_profile_photo,
			CASE 
				WHEN last_message.audio_path IS NOT NULL THEN 'A voice message has been sent'
				ELSE last_message.message
			END AS last_message,
			last_message.created_at AS last_message_created_at,
			CASE 
				WHEN last_message.author_id = $1 THEN TRUE
				ELSE last_message.is_read
			END AS last_message_is_read
		FROM chat
		LEFT JOIN users u1 ON chat.user_1_id = u1.id
		LEFT JOIN users u2 ON chat.user_2_id = u2.id
		LEFT JOIN photos p1 ON u1.profile_photo_id = p1.id
		LEFT JOIN photos p2 ON u2.profile_photo_id = p2.id
		LEFT JOIN (
			SELECT message.conversation_id, message.message, message.created_at, message.is_read, message.author_id, message.audio_path
			FROM message
			WHERE message.conversation_id IN (
				SELECT chat.id
				FROM chat
				WHERE chat.user_1_id = $1 OR chat.user_2_id = $1
			)
			ORDER BY message.created_at DESC
			LIMIT 1
		) AS last_message ON chat.id = last_message.conversation_id
		WHERE chat.user_1_id = $1 OR chat.user_2_id = $1;
	`;

	const result = pool.query(query, [userId]);
	return result;
};

export const getChatInfo = async (chatId) => {
	const query = `
	  SELECT chat.*,
		u1.username AS user_1_name,
		u2.username AS user_2_name,
		p1.url AS user_1_profile_photo,
		p2.url AS user_2_profile_photo,
		u1.is_connected AS user_1_connected,
		u2.is_connected AS user_2_connected,
		u1.last_connected_at AS user_1_last_connected,
        u2.last_connected_at AS user_2_last_connected
	  FROM chat
	  LEFT JOIN users u1 ON chat.user_1_id = u1.id
	  LEFT JOIN users u2 ON chat.user_2_id = u2.id
	  LEFT JOIN photos p1 ON u1.profile_photo_id = p1.id
	  LEFT JOIN photos p2 ON u2.profile_photo_id = p2.id
	  WHERE chat.id = $1;
	`;

	const result = await pool.query(query, [chatId]);
	return result.rows[0];
};

export const getAllMessagesFromChat = async (chatId) => {
	const query = `
		SELECT 
			m.*,
			u.username AS author_name
		FROM message m
		JOIN users u ON m.author_id = u.id
		WHERE m.conversation_id = $1
		ORDER BY m.created_at ASC
	`;

	const result = await pool.query(query, [chatId]);
	return result.rows;
};

export const markMessagesAsRead = async (chatId, currentUserId) => {
	const query = `
		UPDATE message
		SET is_read = TRUE
		WHERE conversation_id = $1 AND author_id != $2
	`;

	const result = await pool.query(query, [chatId, currentUserId]);
	return result.rowCount;
};

export const getUserOtherId = async (chatId, currentUserId) => {
	const query = `
		SELECT user_1_id, user_2_id 
		FROM chat 
		WHERE id = $1
	`;

	const result = await pool.query(query, [chatId]);
  
	if (result.rows.length === 0)
	  throw new Error('chat not found');
  
	const conversation = result.rows[0];
  
	return conversation.user_1_id === currentUserId ? conversation.user_2_id : conversation.user_1_id;
  };
  