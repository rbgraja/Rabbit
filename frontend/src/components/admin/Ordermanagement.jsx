import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { deleteOrderById } from "../../redux/slices/adminOrderSlice";
import { Link } from "react-router-dom";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
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

      console.log("🔄 Fetch Orders API call... retry:", retry);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(
        import.meta.env.VITE_BACKGROUND_URL + "/api/admin/orders",
        config
      );

      const orders = res.data?.orders || [];

      if (orders.length === 0 && !retry) {
        console.warn("⚠️ Empty orders array aayi, retry kar rahe hain...");
        return fetchOrders(true);
      }

      if (orders.length === 0 && retry) {
        console.warn("🚫 Still no orders even after retry.");
      }

      setOrders(orders);
      setError(null);
    } catch (err) {
      console.error("❌ Fetch Orders failed:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchOrders();
    } else {
      console.log("⏭️ User not admin, skipping fetchOrders");
    }
  }, [user]);

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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">📦 Admin - All Orders</h2>

      {loading && <p>Loading orders...</p>}
      {error && <p className="text-red-600 font-semibold mb-4">Error: {error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-xs uppercase">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4 text-center">Action</th>
                <th className="py-3 px-4 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {orders?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-gray-500 italic">
                    🚫 No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
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
                        onChange={(e) =>
                          updatePaymentStatus(order._id, e.target.checked)
                        }
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {updatingOrderId === order._id ? (
                        <span className="text-sm text-blue-600 font-semibold">
                          Updating...
                        </span>
                      ) : (
                        "-"
                      )}
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
      )}
    </div>
  );
}

export default AdminOrders;
