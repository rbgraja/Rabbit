import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../redux/slices/orderSlice";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Myorder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user: userInfo } = useSelector((state) => state.auth);
  const { orders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    const token = userInfo?.token || localStorage.getItem("userToken");

    if (token) {
      dispatch(fetchOrders({ token, isAdmin: false }));
    }
  }, [dispatch, userInfo]);

  const handleRowClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  // ✅ Skeleton row (table loading state)
  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <tr key={index} className="border-b">
        <td className="py-3 px-4">
          <Skeleton className="w-12 h-12 rounded-lg" />
        </td>
        <td className="py-3 px-4">
          <Skeleton className="h-4 w-24" />
        </td>
        <td className="py-3 px-4">
          <Skeleton className="h-4 w-32" />
        </td>
        <td className="py-3 px-4">
          <Skeleton className="h-4 w-28" />
        </td>
        <td className="py-3 px-4">
          <Skeleton className="h-4 w-12" />
        </td>
        <td className="py-3 px-4">
          <Skeleton className="h-4 w-16" />
        </td>
        <td className="py-3 px-4">
          <Skeleton className="h-5 w-14 rounded-full" />
        </td>
      </tr>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">My Orders</h2>

      <div className="relative shadow-md sm:rounded-lg overflow-hidden bg-white">
        <table className="min-w-full text-left text-gray-500">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4">Shipping Address</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              renderSkeletonRows()
            ) : error ? (
              <tr>
                <td colSpan={7} className="text-center text-red-500 font-medium py-6">
                  {error}
                </td>
              </tr>
            ) : orders?.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order._id}
                  onClick={() => handleRowClick(order._id)}
                  className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="py-2 px-4">
                    <img
                      src={order.orderItems?.[0]?.image || "/placeholder.png"}
                      alt={order.orderItems?.[0]?.name || "Product"}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  </td>
                  <td className="py-2 px-4 font-medium text-gray-900 whitespace-nowrap">
                    #{order._id}
                  </td>
                  <td className="py-2 px-4">
                    {new Date(order.createdAt).toLocaleDateString()}{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-4">
                    {order.shippingAddress?.city && order.shippingAddress?.country
                      ? `${order.shippingAddress.city}, ${order.shippingAddress.country}`
                      : "N/A"}
                  </td>
                  <td className="py-2 px-4">{order.orderItems?.length || 0}</td>
                  <td className="py-2 px-4">
                    ${Number(order.totalPrice || 0).toFixed(2)}
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.isPaid
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.isPaid ? "Paid" : "UnPaid"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                  You have no orders.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Myorder;
