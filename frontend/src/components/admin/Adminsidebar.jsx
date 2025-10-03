import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FaCommentDots ,FaBoxOpen, FaClipboardList, FaSignOutAlt, FaUser } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'       // Redux logout action
import { clearCartState } from '../../redux/slices/cartSlice'  // Redux cart clear

function Adminsidebar() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handlelogout = () => {
    dispatch(logout())             // Redux logout
    dispatch(clearCartState())     // Redux cart clear
    localStorage.removeItem("userToken") // localStorage se token remove karo
    localStorage.removeItem("cart")      // localStorage se cart remove karo (agar use kar rahe ho)
    navigate("/login")             // Login page pe redirect karo (ya "/" jahan chahiye)
  }

  return (
    <div className='p-6 mb-6'>
      <div className='mb-6'>
        <Link to="/admin" className='text-2xl font-medium'>
          Rabbit
        </Link>
      </div>
      <h2 className='text-xl font-medium mb-6 text-center'>
        Admin Dashboard
      </h2>
      <nav className='flex flex-col space-y-2'>
        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive
              ? "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2"
              : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"
          }
        >
          <FaUser />
          <span>User</span>
        </NavLink>
        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            isActive
              ? "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2"
              : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"
          }
        >
          <FaBoxOpen />
          <span>Products</span>
        </NavLink>
        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            isActive
              ? "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2"
              : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"
          }
        >
          <FaClipboardList />
          <span>Orders</span>
        </NavLink>
   
<NavLink
  to="/admin/testimonials"
  className={({ isActive }) =>
    isActive
      ? "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2"
      : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"
  }
>
  <FaCommentDots />
  <span>Testimonials</span>
</NavLink>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2"
              : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2"
          }
        >
          <FaUser />
          <span>Shop</span>
        </NavLink>
      </nav>
      <div className='mt-6'>
        <button
          onClick={handlelogout}
          className='w-full bg-red hover:bg-black text-white py-2 px-4 rounded flex items-center justify-center space-x-2'
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Adminsidebar
