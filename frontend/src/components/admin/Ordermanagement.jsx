import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { deleteOrderById } from "../../redux/slices/adminOrderSlice";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const fetchOrders = async (retry = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("No token found, please login again");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(
        import.meta.env.VITE_BACKGROUND_URL + "/api/admin/orders",
        config
      );

      const orders = res.data?.orders || [];

      if (orders.length === 0 && !retry) return fetchOrders(true);

      setOrders(orders);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchOrders();
  }, [user]);

  // ✅ Filter orders by searchTerm
  useEffect(() => {
    if (!searchTerm) {
      setFilteredOrders(orders);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = orders.filter(
        (o) =>
          (o._id && o._id.toLowerCase().includes(term)) ||
          (o.user?.name && o.user.name.toLowerCase().includes(term))
      );
      setFilteredOrders(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, orders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("No token found");

      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(
        import.meta.env.VITE_BACKGROUND_URL + `/api/admin/orders/${orderId}`,
        { status: newStatus },
        config
      );

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
    } catch (err) {
      alert("Failed to update order status: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const updatePaymentStatus = async (orderId, newIsPaid) => {
    const confirmMsg = newIsPaid
      ? "Mark this order as Paid?"
      : "Mark this order as Unpaid?";
    if (!window.confirm(confirmMsg)) return;

    setUpdatingOrderId(orderId);
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("No token found");

      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(
        import.meta.env.VITE_BACKGROUND_URL + `/api/admin/orders/${orderId}/payment`,
        { isPaid: newIsPaid },
        config
      );

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, isPaid: newIsPaid } : order
        )
      );
    } catch (err) {
      alert("Failed to update payment status: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    setUpdatingOrderId(orderId);
    try {
      await dispatch(deleteOrderById(orderId)).unwrap();
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      alert("Order deleted successfully");
    } catch (err) {
      alert("Failed to delete order: " + err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // ✅ Pagination calculations
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">📦 Admin - All Orders</h2>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Order ID or User..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              {["Order ID","User","Total","Status","Paid","Action","Delete"].map((h)=>(<th key={h} className="py-3 px-4">{h}</th>))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="py-3 px-4"><Skeleton width={120} /></td>
                  <td className="py-3 px-4"><Skeleton width={100} /></td>
                  <td className="py-3 px-4"><Skeleton width={80} /></td>
                  <td className="py-3 px-4"><Skeleton width={100} height={28} /></td>
                  <td className="py-3 px-4 text-center"><Skeleton circle width={20} height={20} /></td>
                  <td className="py-3 px-4 text-center"><Skeleton width={60} /></td>
                  <td className="py-3 px-4 text-center"><Skeleton width={70} /></td>
                </tr>
              ))
            ) : currentOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-5 text-gray-500 italic">
                  🚫 No orders found
                </td>
              </tr>
            ) : (
              currentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-blue-600">
                    <Link to={`/admin/orders/${order._id}`} className="hover:underline">
                      {order._id}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{order.user?.name || "Unknown"}</td>
                  <td className="py-3 px-4">Rs {order.totalPrice}</td>
                  <td className="py-3 px-4">
                    <select
                      value={order.orderStatus}
                      disabled={updatingOrderId === order._id}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                      <option value="Processing">Processing</option>
                      <option value="On the way">On the way</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      disabled={updatingOrderId === order._id}
                      checked={!!order.isPaid}
                      onChange={(e) => updatePaymentStatus(order._id, e.target.checked)}
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    {updatingOrderId === order._id ? (
                      <span className="text-sm text-blue-600 font-semibold">Updating...</span>
                    ) : "-"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      disabled={updatingOrderId === order._id}
                      onClick={() => deleteOrder(order._id)}
                      className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-3">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : ""}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
