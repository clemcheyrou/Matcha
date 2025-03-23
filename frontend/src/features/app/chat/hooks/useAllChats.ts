import { useEffect, useState } from 'react';
import socket from '../../../../service/socket';

type Chat = {
	id: number;
	name: string;
	user_id_1: number;
	user_id_2: number;
	photo: string;
  last_message: string;
  last_message_created_at: string;
  last_message_is_read: boolean
}
export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    socket.emit('getChatsRequest');

    socket.on('chatsFetched', (chats) => {
      setChats(chats);
    });

    socket.on('error', (errorData) => {
      setError(errorData.message);
    });

    return () => {
      socket.off('chatsFetched');
      socket.off('error');
    };
  }, []);

  return { chats, error };
};
