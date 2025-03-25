import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMessages } from './hooks/useMessages.ts';
import  { MessageInput } from './conversation/MessageInput.tsx';
import { Header } from './conversation/Header.tsx';
import { MessageList } from './conversation/MessageList.tsx';

export const Conversation: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();

  const {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
	sendAudio,
	setNewAudio,
	markMessagesAsRead
  } = useMessages(Number(chatId));

  useEffect(() => {
    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <Header chatId={Number(chatId)}/>
      <MessageList messages={messages} />
      <MessageInput newMessage={newMessage} setNewMessage={setNewMessage} sendMessage={sendMessage} sendAudio={sendAudio} setNewAudio={setNewAudio}/>
    </div>
  );
};
