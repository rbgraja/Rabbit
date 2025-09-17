import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineUser, HiOutlineShoppingBag, HiBars3BottomRight } from 'react-icons/hi2';
import { IoMdClose } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';

import Searchbar from './Searchbar';
import CardDrawer from '../layout/CardDrawer';
import { fetchCart } from '../../redux/slices/cartSlice';

function Navbar() {
  const [draweropen, setdraweropen] = useState(false);
  const [navdraweropen, setnavdraweropen] = useState(false);

  const dispatch = useDispatch();
  const totalQuantity = useSelector((state) => state.cart.totalQuantity);

  // ✅ Load from localStorage
  const userId = localStorage.getItem("userId");
  const guestId = localStorage.getItem("guestId");
 const user = useSelector((state) => state.auth.user);
const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (userId || guestId) {
      dispatch(fetchCart({ userId, guestId }));
    }
  }, [dispatch, userId, guestId]);

  console.log("🛒 Cart Items:", useSelector(state => state.cart.cartItems));
  console.log("🛒 Total Quantity:", totalQuantity);

  return (
    <>
      <nav className='max-auto flex items-center justify-between py-4 px-6'>
        {/* Logo */}
        <div>
          <Link to="/" className='text-2xl font-medium'>Rabiit</Link>
        </div>

        {/* Center Navigation */}
        <div className='hidden md:flex items-center space-x-6'>
          <Link to="/collection?gender=Men" className='text-gray-300 hover:text-black text-sm font-medium uppercase'>MEN</Link>
          <Link to="/collection?gender=Women" className='text-gray-300 hover:text-black text-sm font-medium uppercase'>Women</Link>
          <Link to="/collection?category=Top+Wear" className='text-gray-300 hover:text-black text-sm font-medium uppercase'>Top Wear</Link>
          <Link to="/collection?category=Bottom+Wear" className='text-gray-300 hover:text-black text-sm font-medium uppercase'>Bottom Wear</Link>
        </div>

        {/* Right Actions */}
        <div className='flex items-center space-x-6'>
          {/* ✅ Admin button conditionally rendered */}
          {isAdmin && (
            <Link to="/admin" className='block bg-black px-2 rounded text-sm text-white'>
              Admin
            </Link>
          )}

          <Link to="/profile" className='hover:text-black'>
            <HiOutlineUser className='h-6 w-6 text-gray-600' />
          </Link>

          {/* Cart Button with quantity */}
          <button onClick={() => setdraweropen(!draweropen)} className='relative hover:text-black'>
            <HiOutlineShoppingBag className='h-6 w-6 text-gray-700' />
            {totalQuantity > 0 && (
              <span className='absolute -top-1 -right-2 bg-red text-white text-xs rounded-full px-2 py-0.5'>
                {totalQuantity}
              </span>
            )}
          </button>

          {/* Searchbar */}
          <div className='overflow-hidden'>
            <Searchbar />
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setnavdraweropen(!navdraweropen)} className='relative md:hidden'>
            <HiBars3BottomRight className='h-6 w-6 text-gray-700' />
          </button>
        </div>
      </nav>

      {/* Cart Drawer */}
      <CardDrawer draweropen={draweropen} togglecartdrawer={() => setdraweropen(!draweropen)} />

      {/* Mobile Menu Drawer */}
      <div className={`fixed top-0 left-0 w-full sm:w-1/2 md:w-[30rem] h-full bg-white shadow-lg transform transition-transform duration-300 flex flex-col z-50 ${navdraweropen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className='flex justify-end p-4'>
          <button onClick={() => setnavdraweropen(false)}>
            <IoMdClose className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <div className='p-4'>
          <h2 className='text-xl font-semibold mb-4'>Menu</h2>
          <nav className='space-y-4'>
            <Link to="/collection?gender=Men" onClick={() => setnavdraweropen(false)} className='block text-gray-300 hover:text-black font-medium uppercase'>MEN</Link>
            <Link to="/collection?gender=Women" onClick={() => setnavdraweropen(false)} className='block text-gray-300 hover:text-black font-medium uppercase'>Women</Link>
            <Link to="/collection?category=Top+Wear" onClick={() => setnavdraweropen(false)} className='block text-gray-300 hover:text-black font-medium uppercase'>Top Wear</Link>
            <Link to="/collection?category=Bottom+Wear" onClick={() => setnavdraweropen(false)} className='block text-gray-300 hover:text-black font-medium uppercase'>Bottom Wear</Link>
          </nav>
        </div>
      </div>
    </>
  );
}

export default Navbar;
