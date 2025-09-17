import React from 'react'
import {HiOutlineCreditCard, HiShoppingBag} from "react-icons/hi"
import { HiArrowPath } from "react-icons/hi2";
function FeaturesSection() {
  return (
    <section className='py-16 px-4 bg-white'>
        <div className='mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center '>
            {/* feature 1 */}
            <div className='flex flex-col items-center '>
                <div className='p-4 rounded-full mb-4 '>
                    <HiShoppingBag className="text-xl"/>
                 </div>
                    <h4 className='tracking-tighter mb-2'>
                        FREE INTERNATIONAL SHIPPING
                    </h4>
                    <p className='text-gray-600 text-sm tracking-tighter'>
                        on all over order $100.00
                    </p>
               
            </div>
             {/* feature 2*/}
            <div className='flex flex-col items-center'>
                <div className='p-4 rounded-full mb-4'>
                    <HiArrowPath  className="text-xl"/>
                 </div>
                    <h4 className='tracking-tighter mb-2'>
                        45 Days Return
                    </h4>
                    <p className='text-gray-600 text-sm tracking-tighter'>
                        Money back gurantee
                    </p>
               
            </div>
             {/* feature 3 */}
            <div className='flex flex-col items-center'>
                <div className='p-4 rounded-full mb-4'>
                    <HiOutlineCreditCard className="text-xl"/>
                 </div>
                    <h4 className='tracking-tighter mb-2'>
                        Secure Checkout
                    </h4>
                    <p className='text-gray-600 text-sm tracking-tighter'>
                        100% secure checkout process
                    </p>
               
            </div>            
        </div>
    </section>
  )
}

export default FeaturesSection