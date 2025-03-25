import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../../../../service/socket';

export const useCreateChat = () => {
	const navigate = useNavigate();
	const createChat = (userId2: number) => {
	socket.emit('createChatRequest', userId2);
	};

	useEffect(() => {
	const handleChatCreated = (data: { chatId: number }) => {
		const { chatId } = data;
		navigate(`${chatId}`)
	};

	const handleChatAlreadyExists = (data: { chatId: number }) => {
		const { chatId } = data;
		navigate(`${chatId}`)
	};

	const handleError = (data: { message: number }) => {
		console.error(data.message);
	};

	socket.on('chatCreated', handleChatCreated);
	socket.on('chatAlreadyExists', handleChatAlreadyExists);
	socket.on('error', handleError);

	return () => {
		socket.off('chatCreated', handleChatCreated);
		socket.off('chatAlreadyExists', handleChatAlreadyExists);
		socket.off('error', handleError);
	};
	}, [navigate, socket]);

  return { createChat };
};

