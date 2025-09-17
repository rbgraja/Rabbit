import { TbBrandMeta } from "react-icons/tb";
import { IoLogoInstagram } from "react-icons/io";
import { RiTwitterXLine } from "react-icons/ri";

import React from 'react'

function Topbar() {
  return (
    <div className="bg-red text-white">
        <div className='max-auto flex justify-between items-center py-3 px-4'>
            <div className="hidden md:flex item-center space-x-4"> 
                <a href="#" className='hover:text-gray-300'>
                    <TbBrandMeta className="h-5 w-5"/>
                </a>
                  <a href="#" className='hover:text-gray-300'>
                    <IoLogoInstagram className="h-5 w-5"/>
                </a>
                  <a href="#" className='hover:text-gray-300'>
                    <RiTwitterXLine className="h-4 w-4"/>
                </a>
            </div>

            <div className="text-sm text-center flex-grow">
                <span> Lorem ipsum, dolor sit amet consectetur</span>
            </div>

            <div className="text-sm hidden md:block">
                <a href="tel:+12345678" className="hover:text-gray-300">
                    +1 23456789
                </a>

        </div>



        </div>  

    </div>
  )
}

export default Topbar