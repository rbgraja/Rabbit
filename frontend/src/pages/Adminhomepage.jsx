import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

function Adminhomepage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || "";

  // ✅ safeGet helper
  const safeGet = (obj, path, fallback = "N/A") => {
    return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? fallback;
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const fetchDashboardData = async (retry = false) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("No token found");

      const config = { headers: { Authorization: `Bearer ${token}` } };

      console.log("🔄 Fetching Admin Dashboard data...");

      const [statsRes, ordersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/stats`, config),
        axios.get(`${API_BASE_URL}/api/admin/recent-orders?limit=5`, config),
      ]);

      const statsData = {
        totalRevenue: Number(statsRes.data?.totalRevenue) || 0,
        totalOrders: Number(statsRes.data?.totalOrders) || 0,
        totalProducts: Number(statsRes.data?.totalProducts) || 0,
      };

      const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : [];

      if ((!ordersData.length || !statsData.totalOrders) && !retry) {
        console.warn("⚠️ Empty dashboard data aayi, retrying...");
        return fetchDashboardData(true);
      }

      setStats(statsData);
      setRecentOrders(ordersData);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching admin dashboard data:", err);
      setStats({ totalRevenue: 0, totalOrders: 0, totalProducts: 0 });
      setRecentOrders([]);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [API_BASE_URL]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {loading && <p>Loading...</p>}
      {error && (
        <p className="text-red-600 font-semibold mb-4">Error: {error}</p>
      )}

      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 shadow-md rounded-lg">
              <h2 className="text-xl font-semibold">Revenue</h2>
              <p className="text-2xl">${stats.totalRevenue.toFixed(2)}</p>
            </div>

            <div className="p-4 shadow-md rounded-lg">
              <h2 className="text-xl font-semibold">Total Orders</h2>
              <p className="text-2xl">{stats.totalOrders}</p>
              <Link
                to="/admin/orders"
                className="text-blue-500 hover:underline"
              >
                Manage Orders
              </Link>
            </div>

            <div className="p-4 shadow-md rounded-lg">
              <h2 className="text-xl font-semibold">Total Products</h2>
              <p className="text-2xl">{stats.totalProducts}</p>
              <Link
                to="/admin/products"
                className="text-blue-500 hover:underline"
              >
                Manage Products
              </Link>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-gray-500">
                <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Total Price</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                      >
                        <td className="p-4">{order._id}</td>
                        <td className="p-4">{safeGet(order, "user.name")}</td>
                        <td className="p-4">{safeGet(order, "user.email")}</td>
                        <td className="p-4">
                          {safeGet(order, "shippingAddress.phone")}
                        </td>
                        <td className="p-4">
                          ${(Number(order.totalPrice) || 0).toFixed(2)}
                        </td>
                        <td className="p-4">
                          {order.orderStatus || "Processing"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-4 text-center text-gray-500 italic"
                      >
                        🚫 No recent orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Adminhomepage;
