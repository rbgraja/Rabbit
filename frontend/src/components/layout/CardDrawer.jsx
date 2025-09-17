import React from 'react';
import { IoMdClose } from 'react-icons/io';
import CardContent from '../carts/CardContent';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function CardDrawer({ draweropen, togglecartdrawer }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
 const { cart } = useSelector((state) => state.cart);
 const userId = user ? user._id :null;
  const handleCheckout = () => {
    togglecartdrawer();
    if (!user) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 w-full sm:w-1/2 md:w-[30rem] h-full bg-white shadow-lg transform transition-transform duration-300 flex flex-col z-50 ${
        draweropen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Close Button */}
      <div className='flex justify-end p-4 border-b'>
        <button onClick={togglecartdrawer}>
          <IoMdClose className='h-6 w-6 text-gray-600 hover:text-black transition' />
        </button>
      </div>

      {/* Cart Items */}
      <div className='flex-grow overflow-y-auto p-4'>
        <h2 className='text-xl font-semibold mb-4'>Your Cart</h2>
        <CardContent />
      </div>

      {/* Checkout Footer */}
      <div className='p-4 border-t bg-white sticky bottom-0'>
        <button
          onClick={handleCheckout}
          className='w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition duration-200'
        >
          Checkout
        </button>
        <p className='text-sm text-center text-gray-500 mt-2'>
          Shipping, taxes, and discount codes calculated at checkout
        </p>
      </div>
    </div>
  );
}

export default CardDrawer;
