import { users } from '../index.js';
import { checkChat, addNewChat, getAllChats } from '../models/chatModel.js';
import { createNotification } from '../models/notificationModel.js';
import pool from '../utils/db.js';

export const chatHandler = (socket) => {
  socket.on('createChatRequest', (userId2) => {
    const userId1 = socket.request.session.userId;

    if (!userId1 || !userId2) {
      socket.emit('error', { message: 'users not found or not authenticated.' });
      return;
    }

    checkChat(userId1, userId2).then((chatCheckResult) => {
      if (chatCheckResult.length > 0) {
        socket.emit('chatAlreadyExists', { chatId: chatCheckResult[0].id });
      } else {
        addNewChat(userId1, userId2).then((newChatId) => {
          socket.emit('chatCreated', { chatId: newChatId });
          
          if (users[userId2]) {
            socket.to(users[userId2]).emit('notification', `new chat created with user ${userId1}`);
          }
        }).catch((error) => {
          socket.emit('error', { message: 'error while creating chat.' });
        });
      }
    }).catch((error) => {
      socket.emit('error', { message: 'error while checking existing chat.' });
    });
  });

  socket.on('getChatsRequest', async () => {
    const userId = socket.request.session.userId;

    if (!userId) {
      socket.emit('error', { message: 'user not authenticated' });
      return;
    }

    try {
      const result = await getAllChats(userId);

      if (result && result.rows.length > 0) {
        const chatsWithNames = result.rows.map(chat => {
        const name = chat.user_1_id == userId ? chat.user_2_name : chat.user_1_name;
        const photo = chat.user_1_id == userId ? chat.user_2_profile_photo : chat.user_1_profile_photo;
			return {
				...chat,
				name: name,
				photo: photo
			  };
		})
        socket.emit('chatsFetched', chatsWithNames);
      } else {
        socket.emit('chatsFetched', []);
      }
    } catch (error) {
      socket.emit('error', { message: 'error while fetching chats.' });
    }
  });

  socket.on('sendMessage', async (message) => {
    const authorId = socket.request.session.userId;
    const { chat_id, text } = message;

    try {
      const result = await pool.query(
        `SELECT user_1_id, user_2_id FROM chat WHERE id = $1`,
        [chat_id]
      );

      const conversation = result.rows[0];
      const user2Id = conversation.user_1_id === authorId ? conversation.user_2_id : conversation.user_1_id;
	  const name = chat.user_1_id == authorId ? chat.user_2_name : chat.user_1_name;

      const insertResult = await pool.query(
        `INSERT INTO message (message, author_id, conversation_id)
         VALUES ($1, $2, $3) RETURNING id, created_at`,
        [text, authorId, chat_id]
      );

      const newMessage = {
        ...message,
        id: insertResult.rows[0].id,
        created_at: insertResult.rows[0].created_at,
        author_id: authorId,
		isSender: false
      };

      const recipientSocketId = users[user2Id];
      if (recipientSocketId) {
        socket.to(recipientSocketId).emit('receiveMessage', newMessage);
		await createNotification(user2Id, 'message', authorId, `You have received a message from ${name}`);
        socket.to(recipientSocketId).emit('notification', `You have received a message from ${name}`);
      }

      socket.emit('messageSent', newMessage);
    } catch (err) {
      socket.emit('error', { message: 'error sending message' });
    }
  });
};
