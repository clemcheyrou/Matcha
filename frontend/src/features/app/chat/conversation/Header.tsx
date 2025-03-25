import React from 'react';
import { useHeaderChat } from '../hooks/useHeaderChat.ts';
import { MdArrowBackIosNew } from "react-icons/md";
import { Link } from 'react-router-dom';

type HeaderProps = {
  chatId: number;
}

export const Header: React.FC<HeaderProps> = ({ chatId }) => {
	const { name, is_connected, profileImage } = useHeaderChat(chatId);

	return (
	<div className="flex items-center p-4 align-content">
		<Link to={'/chat'} className='mr-6 cursor-pointer'><MdArrowBackIosNew /></Link>
		<img 
			alt="user" 
			src={`${process.env.REACT_APP_API_URL}${profileImage}`} 
			className="w-10 h-10 rounded-full" 
		/>
		<div className='ml-4'>
			<h2 className="mt-0 text-lg font-semibold opacity-100">{name}</h2>
			<p className="mt-0 text-xs font-semibold opacity-60">{is_connected ? 'online' : 'offline'} </p>
		</div>
	</div>
  );
};