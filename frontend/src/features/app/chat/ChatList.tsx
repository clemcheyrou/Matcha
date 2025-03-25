import React from 'react';
import { useChats } from './hooks/useAllChats.ts';
import { Link } from 'react-router-dom';

const formatDate = (date: string) => {
  const messageDate = new Date(date);
  const now = new Date();

  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return messageDate.toLocaleDateString();
  }
};

export const ChatList: React.FC = () => {
  const { chats } = useChats();

  return (
	<div className="w-full rounded-md py-4">
	  {chats.length === 0 ? (
	    <div className="text-white py-4">No chats at this time</div>
	  ) : (
	    chats.map((chat) => (
	      <Link
	        key={chat.id}
	        to={`/chat/${chat.id}`}
	        className="flex items-center space-x-4 py-2 rounded-full cursor-pointer"
	      >
	        <div className="flex items-center space-x-4 py-2 rounded-full cursor-pointer w-full">
	          <div className="w-12 h-12 rounded-full overflow-hidden">
	            <img
	              src={`${process.env.REACT_APP_API_URL}${chat.photo}`}
	              alt={chat.name}
	              className="w-full h-full object-cover"
	            />
	          </div>

	          <div className="flex-1">
	            <div className="flex justify-between items-center mb-2">
	              <h3 className="text-md font-semibold text-white">{chat.name}</h3>
	              <p className="text-xs mt-0 opacity-60">
	                {chat.last_message_created_at &&
	                  formatDate(chat.last_message_created_at)}
	              </p>
	            </div>
	            <p
	              className={`text-xs text-white opacity-60 truncate mt-0 ${
	                !chat.last_message_is_read ? 'font-bold' : ''
	              }`}
	            >
	              {chat.last_message}
	            </p>
	          </div>
	        </div>
	      </Link>
	    ))
	  )}
	</div>
  );
};
