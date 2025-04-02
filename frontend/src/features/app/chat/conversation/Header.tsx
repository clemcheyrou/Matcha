import React from 'react';
import { useHeaderChat } from '../hooks/useHeaderChat.ts';
import { MdArrowBackIosNew } from "react-icons/md";
import { Link } from 'react-router-dom';

type HeaderProps = {
  chatId: number;
}

export const lastConnection = (lastConnection: string | null): string => {
	if (!lastConnection)
		return '';
    const lastConnectionDate = new Date(lastConnection);
    const currentDate = new Date();

    const diffInMs = currentDate.getTime() - lastConnectionDate.getTime();

    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    let timeAgo = '';

    if (diffInDays > 0) {
        timeAgo = `${diffInDays} day(s) ago`;
    } else if (diffInHours > 0) {
        timeAgo = `${diffInHours} hour(s) ago`;
    } else if (diffInMinutes > 0) {
        timeAgo = `${diffInMinutes} minute(s) ago`;
    } else {
        timeAgo = `${diffInSeconds} second(s) ago`;
    }

    return `Last connection : ${timeAgo}`;
}


export const Header: React.FC<HeaderProps> = ({ chatId }) => {
	const { name, is_connected, last_connected_at, profileImage } = useHeaderChat(chatId);

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
			<p className="mt-0 text-xs font-semibold opacity-60">{is_connected ? 'online' : lastConnection(last_connected_at)} </p>
		</div>
	</div>
  );
};