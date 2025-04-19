import React from 'react'
import { Link } from 'react-router-dom'

export const HeaderHome = () => {
  return (
    <header className='mb-16 flex h-16 w-full items-center justify-between pt-16'>
        <div className='flex justify-center'>
            <Link to={"/"}>
                <div>
					{/*<img src={#} alt="logo" className="w-12 h-12" />*/}
                </div>
            </Link>
        </div>
        <nav className='hidden md:flex items-center space-x-10 md:ml-auto'>
			<Link to={"/register"}>
	            <button className='rounded-md border-2 border-solid border-white px-7 py-2 text-white transition-all duration-300 hover:bg-white hover:text-black hover:opacity-75 flex-shrink-0'>
	                Sign up
	            </button>
			</Link>
        </nav>
    </header>
  )
}
