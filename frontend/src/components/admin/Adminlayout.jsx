import React, { useState } from 'react'
import {FaBars} from "react-icons/fa"
import Adminsidebar from './Adminsidebar';
import { Outlet } from 'react-router-dom'
function Adminlayout() {
    const  [isidebaropen,setissidebaropen]= useState(false);

    const toggleSidebar=() =>{
        setissidebaropen(!isidebaropen);
    }
  return (
    <div className='min-h-screen flex flex-col md:flex-row relative'>
        {/* mobile side bar */}
        <div className='flex md:hidden p-4 bg-gray-900 text-white z-20'>
            <button onClick={toggleSidebar}>
                <FaBars size={24} />
            </button>
            <h1 className='ml-4 text-xl font-medium'>Admin Dashboard</h1>
        </div>
        {/* overlay mobile side bar */}
        {isidebaropen && ( <div 
        className='fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden'
        onClick={toggleSidebar} >

        </div>
        )}
        {/* sidebar */}
        <div className={`bg-gray-900 w-64 min-h-screen text-white absolute md:relative transform ${isidebaropen
         ? "translate-x-0" : "-translate-x-full"} 
         transition-transform duration-300 md:translate-x-0 md:static md:block z-20`}>
            {/* side bar content */}
            <Adminsidebar />
        </div>

        {/* main content */}
        <div className='flex-grow p-6 overflow-auto'>
            <Outlet />
        </div>
    </div>
  )
}

export default Adminlayout