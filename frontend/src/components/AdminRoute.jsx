import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

/**
 * ❗Only allow access to users with role === 'admin'
 * ⛔ Others will be redirected to login
 */
const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  // Agar user nahi hai ya role admin nahi hai toh redirect
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // ✅ Agar user admin hai toh content dikhao
  return children;
};

export default AdminRoute;
