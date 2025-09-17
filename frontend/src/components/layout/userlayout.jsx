// src/components/layout/Userlayout.jsx
import React, { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Header from '../common/Header';
import Footer from '../common/Footer';
import { fetchCart } from '../../redux/slices/cartSlice';

function Userlayout() {
  const dispatch = useDispatch();
  const didFetch = useRef(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const guestId = localStorage.getItem('guestId');

    if (!didFetch.current && (userId || guestId)) {
      dispatch(fetchCart({ userId, guestId }));
      didFetch.current = true;
    }
  }, [dispatch]);

  return (
    <>
      {/* header */}
      <Header />

      {/* body */}
      <main>
        <Outlet />
      </main>

      {/* footer */}
      <Footer />
    </>
  );
}

export default Userlayout;
