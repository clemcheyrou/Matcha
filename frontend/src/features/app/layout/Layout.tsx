import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation.tsx'
import { Header } from './Header.tsx'

export const Layout = () => {
  return (
	<div className='h-[90vh] max-h-[90vh] flex flex-col text-white px-6 md:px-28 lg:px-60'>
	<Header />
		<div className='flex-1 overflow-x pb-[60px]'>
			<Outlet />
		</div>
	<div className='absolute bottom-0 left-0 w-full'>
    	<Navigation />
  	</div>
  </div>
  )
}
