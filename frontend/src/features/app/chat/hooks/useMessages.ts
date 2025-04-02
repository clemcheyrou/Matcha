import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socket from '../../../../service/socket';
import { AppDispatch } from '../../../../store/store';
import { fetchUser } from '../../../../store/slice/authSlice.ts';

interface Message {
  id: number;
  text?: string;
  sender: string;
  isSender: boolean;
  author_id: number;
  created_at: string;
  chat_id: number;
  author_name?: string;
  message?: string;
  audio_path?: string;
}

export const useMessages = (chatId: number) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [, setNewAudio] = useState<string>('');
	const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: any) => state.auth.user);
  const userId: number = user?.id;

  const markMessagesAsRead = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/${chatId}/messages/mark-read`, {
        method: 'POST',
        credentials: 'include',
      });

      await response.json();
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      await dispatch(fetchUser());
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/${chatId}/messages`, { credentials: 'include' });
        const data = await res.json();
        const formattedMessages = data.map((msg: Message) => ({
          id: msg.id,
          text: msg.message,
          sender: msg.author_name,
          isSender: msg.author_id === userId,
          author_id: msg.author_id,
          created_at: msg.created_at,
          audio_path: msg.audio_path,
        }));
        setMessages(formattedMessages);
        markMessagesAsRead();
      } catch (err) {
        console.error('error fetching messages:', err);
      }
    };

    fetchMessages();

    const handleReceiveMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
      if (message.author_id !== userId) {
        markMessagesAsRead();
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
    // eslint-disable-next-line
  }, [chatId, userId, dispatch]);

  const sendMessage = () => {
    const message: Message = {
      id: Date.now(),
      text: newMessage,
      sender: user?.username,
      isSender: true,
      chat_id: chatId,
      author_id: userId,
      created_at: new Date().toISOString(),
    };

    socket.emit('sendMessage', message);
    setMessages((prev) => [...prev, message]);
    setNewMessage('');
  };

  const sendAudio = () => {
    const message: Message = {
      id: Date.now(),
      audio_path: newMessage,
      sender: user?.username,
      isSender: true,
      chat_id: chatId,
      author_id: userId,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);
    setNewAudio('');
  };

  return { messages, newMessage, setNewMessage, sendMessage, sendAudio, setNewAudio, markMessagesAsRead };
};
