import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import register from '../assets/register.webp';
import { registerUser } from '../redux/slices/authSlice';
import { mergeGuestCartOnLogin, fetchCart } from '../redux/slices/cartSlice';
import { useDispatch, useSelector } from 'react-redux';

function Register() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [name, setname] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, guestId } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirect.includes("checkout");

  useEffect(() => {
    const syncCartAfterSignup = async () => {
      if (user) {
        const guestCart = JSON.parse(localStorage.getItem("cart"))?.cartItems || [];

        if (guestCart.length > 0 && guestId) {
          await dispatch(
            mergeGuestCartOnLogin({
              userId: user._id,
              guestCart,
              guestId,
            })
          );
          localStorage.removeItem("cart");
          localStorage.removeItem("guestId");
        } else {
          await dispatch(fetchCart({ userId: user._id }));
        }

        navigate(isCheckoutRedirect ? "/checkout" : "/");
      }
    };

    syncCartAfterSignup();
  }, [user, guestId, dispatch, isCheckoutRedirect, navigate]);

  const handlesubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser({ name, email, password }));
  };

  return (
    <div className='flex'>
      <div className='w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12'>
        <form onSubmit={handlesubmit} className='w-full max-w-md bg-white p-8 rounded-lg border shadow-sm'>
          <div className='flex justify-center mb-6'>
            <h2 className='text-xl font-medium'>Rabbit</h2>
          </div>
          <h2 className='text-2xl font-bold text-center mb-6'>Hey There! 👋</h2>
          <p className='text-center mb-6'>Enter your username and password to Sign Up</p>

          <div className='mb-4'>
            <label className='block text-sm font-semibold mb-2'>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setname(e.target.value)}
              className='w-full p-2 border rounded'
              placeholder='Enter your Name'
              required
            />
          </div>

          <div className='mb-4'>
            <label className='block text-sm font-semibold mb-2'>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              className='w-full p-2 border rounded'
              placeholder='Enter your email address'
              required
            />
          </div>

          <div className='mb-4'>
            <label className='block text-sm font-semibold mb-2'>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              className='w-full p-2 border rounded'
              placeholder='Enter your password'
              required
            />
          </div>

          <button
            type='submit'
            className='bg-black w-full text-white p-2 rounded-lg font-semibold hover:border-s-gray-800 transition-all'
          >
            Sign Up
          </button>

          <p className='mt-6 text-center text-sm'>
            Already have an account?{" "}
            <Link
              to={`/login?redirect=${encodeURIComponent(redirect)}`}
              className='text-blue-500'
            >
              Login
            </Link>
          </p>
        </form>
      </div>

      <div className='hidden md:block w-1/2 bg-gray-800'>
        <div className='h-full flex flex-col justify-center items-center'>
          <img src={register} alt="register to account" className='h-[750px] w-full object-cover' />
        </div>
      </div>
    </div>
  );
}

export default Register;
