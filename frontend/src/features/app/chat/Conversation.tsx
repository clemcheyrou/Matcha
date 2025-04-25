import React, {useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessages } from './hooks/useMessages.ts';
import  { MessageInput } from './conversation/MessageInput.tsx';
import { Header } from './conversation/Header.tsx';
import { MessageList } from './conversation/MessageList.tsx';

export const Conversation: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatHeader = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/${chatId}/exist`, {credentials: 'include'});
        const data = await response.json();
        if (!data)
          navigate('/chat')
      } catch (error) {
        console.error('error', error);
      }
    };

    if (chatId) {
      fetchChatHeader();
    }
  }, [chatId, navigate]);

  const {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    sendAudio,
  } = useMessages(Number(chatId));

  return (
    <div className="flex flex-col h-full">
      <Header chatId={Number(chatId)}/>
      <MessageList messages={messages} />
      <MessageInput newMessage={newMessage} setNewMessage={setNewMessage} sendMessage={sendMessage} sendAudio={sendAudio}/>
    </div>
  );
};
