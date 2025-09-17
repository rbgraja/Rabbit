import React from 'react'
import { TbBrandMeta } from 'react-icons/tb'
import { IoLogoInstagram } from 'react-icons/io'
import { Link } from 'react-router-dom'
import { RiTwitterXLine } from 'react-icons/ri'
import { FiPhoneCall } from 'react-icons/fi'
function Footer() {
  return ( 
    <footer>
        <div className='mx-auto grid grid-cols-1 md:grid-cols-4  gap-8 px-4 '>
            <div>
                <h3 className='text-lg text-gray-800 mb-4'>
                    Newsletter
                </h3>
                <p className='text-gray-500 mb-4'>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed et
                </p>
                <p className='font-medium  text-gray-600 mb-6'> 
                    Lorem ipsum dolor sit
                </p>
                {/* form */}
                <form className='flex'>
                    <input type="email" placeholder='Enter you email' className='p-3 w-full test-sm border-t border-b border-l border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all ' required/>
                    <button type='submit' className='bg-black text-white px-6 py-3 text-sm rounded-r-md hover:bg-gray-800 transition-all'>Subscribe</button>

                </form>
            </div>
            {/* shop links */}
            <div>
                <h3 className='text-lg text-gray-800 mb-4'>Shop</h3>
                <ul className='space-y-2 text-gray-600'>
                    <li>
                        <Link to='#' className='hover:text-gray-500 transition-colors'>Mens Top Wear</Link>
                    
                    </li>
                    <li>
                        <Link to='#' className='hover:text-gray-500 transition-colors'>Women Top Wear</Link>
                    </li>
                    <li>
                        <Link to='#' className='hover:text-gray-500 transition-colors'>Mens Bottom Wear</Link>
                    </li> 
                    <li>
                        <Link to='#' className='hover:text-gray-500 transition-colors'>Women Bottom Wear</Link>
                     </li>

                    

                </ul>
            </div>
            {/* support links */}
             <div>
                <h3 className='text-lg text-gray-800 mb-4'>Support</h3>
                <ul className='space-y-2 text-gray-600'>
                    <li>
                        <Link to='#' className='hover:text-gray-500 transition-colors'>Contact Us</Link>
                    
                    </li>
                    <li>
                        <Link to='#' className='hover:text-gray-500 transition-colors'>About Us</Link>
                    </li>
                    <li>
                        <Link to='#' className='hover:text-gray-500 transition-colors'>FAQS</Link>
                    </li> 
                    <li>
                        <Link to='#' className='hover:text-gray-500 transition-colors'>Features </Link>
                     </li>

                    

                </ul>
            </div>
            {/* follow section */}
            <div>
                <h3 className='text-lg text-gray-800 mb-4'>Follow Us</h3>
                <div className='flex items-center space-x-4 mb-6'>
                    <a href="https://www.facebook.com/" target='_blank' rel='nopener noreferrer' className='hover:text-gray-500'>
                        <TbBrandMeta  className='h-5 w-5'/>
                    </a>
                    <a href="https://www.facebook.com/" target='_blank' rel='nopener noreferrer' className='hover:text-gray-500'>
                        <IoLogoInstagram  className='h-5 w-5'/>
                    </a>
                    <a href="https://www.facebook.com/" target='_blank' rel='nopener noreferrer' className='hover:text-gray-500'>
                        <RiTwitterXLine  className='h-4 w-4'/>
                    </a>
                 
                </div>
                 <p className='text-gray-500'>
                    Call us
                  </p>
                  <p>
                  <FiPhoneCall className='inline-block mr-2 ' /> 123456789
                    </p>
            </div>
        </div>
        {/* footer bootom */}
        <div className='mx-auto mt-12 px-4 lg:px-0 border-t border-gray-200 pt-6 '> 
            <p className='text=gray-500 text-sm tracking-tigher text-center'>Lorem ipsum dolor sit, amet  </p>
        </div>

    </footer>
  )
}

export default Footer