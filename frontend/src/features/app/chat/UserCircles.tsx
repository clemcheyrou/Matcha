import React from 'react';
import { useMatchedUsers } from '../discover/hooks/useMatchedUsers.ts';
import { useCreateChat } from './hooks/useCreateChat.ts';

export const UserCircles: React.FC = () => {
  const { users } = useMatchedUsers();
  const { createChat } = useCreateChat();

  return (
    <div className="flex items-center space-x-4 overflow-x-auto py-2">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex flex-col items-center text-center space-y-2"
        >
          <div className="w-16 h-16 rounded-full overflow-hidden cursor-pointer" onClick={() => createChat(user.id)}>
            <img
              src={`${process.env.REACT_APP_API_URL}${user.profile_photo}`}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
};