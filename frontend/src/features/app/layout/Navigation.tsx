import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GoHome } from 'react-icons/go';
import { PiMapPinSimpleArea } from 'react-icons/pi';
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../store/store.ts';
import { setActivePage } from '../../../store/slice/navigationSlice.ts';

export const Navigation: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const activePage = useSelector((state: RootState) => state.navigation.activePage);

  const handleNavigation = (page: string, path: string) => {
    dispatch(setActivePage(page));
    navigate(path);
  };

  const getButtonClass = (page: string): string =>
    `flex flex-col items-center ${
      activePage === page ? 'text-pink-500' : 'text-white'
  }`;

  return (
    <div>
	  <div className='bg-bg shadow-md p-4 flex justify-around'>
	  <button
          className={getButtonClass('home')}
          onClick={() => handleNavigation('home', '/home')}
        >
          <span>
            <GoHome size={26} />
          </span>
          <span className='text-sm'>Home</span>
        </button>
        <button
          className={getButtonClass('nearby')}
          onClick={() => handleNavigation('nearby', '/nearby')}
        >
          <span>
            <PiMapPinSimpleArea size={24} />
          </span>
          <span className='text-sm'>Nearby</span>
        </button>
		<button
          className={getButtonClass('events')}
          onClick={() => handleNavigation('events', '/events')}
        >
          <span>
            <AiOutlineCalendar size={24} />
          </span>
          <span className='text-sm'>Date</span>
        </button>
        <button
          className={getButtonClass('chat')}
          onClick={() => handleNavigation('chat', '/chat')}
        >
          <span>
            <HiOutlineChatBubbleLeftRight size={26} />
          </span>
          <span className='text-sm'>Chat</span>
        </button>
        <button
          className={getButtonClass('profil')}
          onClick={() => handleNavigation('profil', '/profil')}
        >
          <span>
            <AiOutlineUser size={26} />
          </span>
          <span className='text-sm'>Profil</span>
        </button>
      </div>
    </div>
  );
};
