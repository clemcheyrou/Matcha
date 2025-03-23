import React from 'react'
import { RxCross2 } from 'react-icons/rx';
import { useNotification } from './hooks/useNotification.ts';
import { SettingsDropdown } from '../settings/SettingsDropdown.tsx';
import { NotificationPopin } from './NotificationPopin.tsx';

export const Header = () => {
	const { notification, showNotification, handleCloseNotification } = useNotification();
  
  	return (
	<>
	 {showNotification && notification && (
		<div
		  className={`absolute top-12 w-64 h-18 right-6 bg-white rounded-lg p-4`}
		>
		  <div className="flex justify-between items-center text-black">
			<span>{notification}</span>
			<span
			  className="cursor-pointer text-xl ml-3"
			  onClick={handleCloseNotification}
			>
			  <RxCross2 />
			</span>
		  </div>
		</div>
	  )}

	  <div className="flex justify-between items-center mt-6 mx-6">
		<div>
		  {/*<span className="opacity-60 text-sm">Localisation</span>
		  <div className="flex items-center space-x-2">
			<LuSend />
			<span>Paris, France</span>
			<div className="relative">
			  <SlArrowDown
				size={10}
				className="cursor-pointer text-transparent"
				onClick={toggleDropdown}
			  />
			  {showDropdown && (
				<div className="absolute right-2 mt-2 bg-white shadow-lg rounded w-36">
				  <ul className="py-2 text-gray-500 text-sm">
					<li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
					  Lieu actuel
					</li>
					<li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
					  Adresse 1
					</li>
					<li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
					  Adresse 2
					</li>
				  </ul>
				</div>
			  )}
			</div>
		  </div>*/}
		</div>
		<div className='flex items-center gap-x-6'>
			<NotificationPopin/>
			<SettingsDropdown/>
		</div>
	  </div>
	</>
  	)
}
