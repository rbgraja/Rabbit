import React from 'react'
import menimage from '../../assets/mens-collection.webp'
import womensimage from '../../assets/womens-collection.webp'
import { Link } from 'react-router-dom'
function Gendercollectionsection() {
  return (
    <section className='py-16 px-4 lg:px-0'>
        <div className='mx-auto flex flex-col md:flex-row gap-8'>
            {/* women collection */}
            <div className='relative flex-1'>
                <img src={womensimage} alt="women" className='w-full h-[700px] object-cover ' />
                <div className='absolute bottom-8 left-8 bg-white bg-opacity-90 p-4'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-3'>
                        Women's Collection
                    </h2>
                    <Link to='/collection?gender=Women' className='text-gray-900 underline'>
                        Shop now 
                    </Link>
                </div>
            </div>
            {/* Men collection */}
            <div className='relative flex-1'>
                <img src={menimage} alt="men" className='w-full h-[700px] object-cover ' />
                <div className='absolute bottom-8 left-8 bg-white bg-opacity-90 p-4'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-3'>
                        Men's Collection
                    </h2>
                    <Link to='/collection?gender=Men' className='text-gray-900 underline'>
                        Shop now 
                    </Link>
                </div>
            </div>
            
        </div> 

    </section>
  )
}

export default Gendercollectionsection