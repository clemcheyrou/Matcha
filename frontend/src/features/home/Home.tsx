import React from 'react'
import { RxArrowTopRight } from "react-icons/rx";
import { Header } from '../header/Header.tsx';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className='mb-16 h-screen w-screen text-white px-6 md:px-28 lg:px-96'>
        <Header/>
        <div className='h-full'>
          <div className='h-88 rounded-lg'>
            <img src='https://plus.unsplash.com/premium_photo-1661609291595-3a849ea67002?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' alt='img' className='w-full h-[40vh] object-cover'/>
          </div>
          <div className='mt-8'>
            <h1>Embrace a new way of dating</h1>
            <h2>Lorem ipsum dolor sit amet consectetur, lorem ipsum dolor sit amet consectetur.</h2>
          </div>
          <Link to='/register'>
            <div className='flex items-center space-x-4 font-agbalumo text-black rounded-md px-4 py-2 max-w-max mt-6 bg-pink text-white cursor-pointer hover:bg-white hover:text-pink'>
                Get started
                <RxArrowTopRight />
            </div>
          </Link>
          <p>Already have an account? <Link to={"/login"}><span className='text-pink font-bold cursor-pointer'>Sign in</span></Link></p>
        </div>
    </div>
  )
}
