import React from 'react';
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
  } = useMessages(Number(chatId));

  console.log(messages)
  return (
    <div className="flex flex-col h-full">
      <Header chatId={Number(chatId)}/>
      <MessageList messages={messages} />
      <MessageInput newMessage={newMessage} setNewMessage={setNewMessage} sendMessage={sendMessage} sendAudio={sendAudio}/>
    </div>
  );
};
