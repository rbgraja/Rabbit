import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../redux/slices/adminSlice";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Usermanagement() {
  const dispatch = useDispatch();
  const { adminUsers, loading, error } = useSelector((state) => state.admin);

  const [formdata, setformdata] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const handleform = (e) => {
    setformdata({
      ...formdata,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createUser(formdata));
    setformdata({
      name: "",
      email: "",
      password: "",
      role: "customer",
    });
  };

  const handlerolechange = (userid, newrole) => {
    dispatch(updateUser({ userId: userid, updates: { role: newrole } }));
  };

  const handledeleteuser = (userid) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(userid));
    }
  };

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      {/* Add new user form */}
      <div className="p-6 rounded-lg mb-6 border bg-white">
        <h3 className="text-lg font-bold mb-4">Add New User</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formdata.name}
              onChange={handleform}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formdata.email}
              onChange={handleform}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formdata.password}
              onChange={handleform}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Role</label>
            <select
              name="role"
              value={formdata.role}
              onChange={handleform}
              className="w-full p-2 border rounded"
              required
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Add User
          </button>
        </form>
      </div>

      {error && <p className="text-red font-semibold mb-4">Error: {error}</p>}

      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full text-left text-gray-500">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td className="p-4">
                    <Skeleton width={120} />
                  </td>
                  <td className="p-4">
                    <Skeleton width={180} />
                  </td>
                  <td className="p-4">
                    <Skeleton width={100} />
                  </td>
                  <td className="p-4">
                    <Skeleton width={70} height={30} />
                  </td>
                </tr>
              ))
            ) : adminUsers && adminUsers.length > 0 ? (
              adminUsers.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handlerolechange(user._id, e.target.value)
                      }
                      className="p-2 border rounded"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handledeleteuser(user._id)}
                      className="bg-red text-white px-4 py-2 rounded hover:bg-black-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Usermanagement;
