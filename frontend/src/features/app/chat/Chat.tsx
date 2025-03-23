import React from 'react'
import { ChatList } from './ChatList.tsx';
import { UserCircles } from './UserCircles.tsx';

export const Chat = () => {
  	return (
	<div className='mx-6 mt-4'>
		<UserCircles/>
		<ChatList/>
	</div>
  )
}
