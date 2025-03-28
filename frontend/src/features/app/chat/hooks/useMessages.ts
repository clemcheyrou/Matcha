import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import socket from '../../../../service/socket';

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

  const user = useSelector((state: any) => state.auth.user);
  const userId: number = user?.id;

  const markMessagesAsRead = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/${chatId}/messages/mark-read`, {
        method: 'POST',
        credentials: 'include',
      });
  
      if (!res.ok) {
        throw new Error('error marking messages as read: ' + res.statusText);
      }
  
      await res.json();
    } catch (err) {
      console.error('error marking messages as read:', err);
    }
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/chat/${chatId}/messages`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const formattedMessages = data.map((msg: Message) => ({
          id: msg.id,
          text: msg.message,
          sender: msg.author_name,
          isSender: msg.author_id === userId,
          author_id: msg.author_id,
          created_at: msg.created_at,
		  audio_path: msg.audio_path
        }));
        setMessages(formattedMessages);
        markMessagesAsRead();
      })
      .catch((err) => console.error('Error fetching messages:', err));

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
  }, [chatId, markMessagesAsRead]);

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

  return { messages, newMessage, setNewMessage, sendMessage, sendAudio, setNewAudio, markMessagesAsRead};
};
