import { useState, useEffect } from 'react';
import { User } from '../../type/type';
import socket from '../../../../service/socket';

export const useMatchedUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
	const fetchUsers = async () => {
	  try {
		const response = await fetch(`${process.env.REACT_APP_API_URL}/api/match/matches`, { credentials: 'include' });
		if (!response.ok) {
		  throw new Error('failed to fetch users');
		}
		const data = await response.json();
		setUsers(data);
	  } catch (err) {
		setError(err instanceof Error ? err.message : 'an unknown error occurred');
	  } finally {
		setLoading(false);
	  }
	};

	fetchUsers();

	const removeUserFromMatch = (unmatchedUserId: number) => {
		setUsers((prevUsers) => prevUsers.filter(user => user.id !== unmatchedUserId));
	  };

	const addUserFromMatch = (matchedUser: User) => {
		setUsers([...users, matchedUser]);
	};

	  socket.on('unmatch', removeUserFromMatch);
	  socket.on('match', addUserFromMatch);
	  return () => {
		socket.off('unmatch', removeUserFromMatch);
		socket.off('match', addUserFromMatch);
	  };

  }, []);

  return { users, loading, error };
};
