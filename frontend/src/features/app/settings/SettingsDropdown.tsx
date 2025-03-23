import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdSettings } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../../store/slice/authSlice.ts';
import { AppDispatch } from '../../../store/store.ts';

export const SettingsDropdown = () => {
	const [isOpen, setIsOpen] = useState(false);
  	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	const logout = () => {
		dispatch(logoutUser());
		navigate('/')
	};

  return (
    <div className="relative">
      <div className='cursor-pointer' onClick={toggleDropdown}>
        <IoMdSettings size={20}/>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-6 mt-2 w-48 bg-[#191919] rounded shadow-lg z-10 text-black">
          <Link to="/settings" className="block px-4 py-2">
            <p>Edit account</p>
          </Link>
          <Link to="/history" className="block px-4 py-2">
		  	<p className='mt-0'>History</p>
          </Link>
		  <Link to="/blocked" className="block px-4 py-2">
		  	<p className='mt-0'>Blocked Users</p>
          </Link>
		  <Link to="/reported" className="block px-4 py-2">
		  	<p className='mt-0'>Reported Users</p>
          </Link>
          <div className="block px-4 py-2 cursor-pointer" onClick={logout}>
		  	<p className='mt-0 mb-4'>Log out</p>
          </div>
        </div>
      )}
    </div>
  );
};
