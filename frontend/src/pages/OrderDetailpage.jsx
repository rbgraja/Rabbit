import React, { useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetailById } from "../redux/slices/orderSlice";

// ✅ Local Skeleton Component
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />;
}

function OrderDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();

  const { user, token } = useSelector((state) => state.auth);
  const { orderDetail, loading, error } = useSelector((state) => state.orders);

  const order =
    orderDetail?.order ||
    (orderDetail?.success ? orderDetail : null) ||
    orderDetail;

  useEffect(() => {
    const localToken = localStorage.getItem("userToken");
    const finalToken = token || localToken;

    if (!finalToken) return;

    dispatch(
      fetchOrderDetailById({
        orderId: id,
        token: finalToken,
      })
    );
  }, [dispatch, id, token]);

  if (!localStorage.getItem("userToken") && !token) {
    return (
      <p className="p-6 text-center text-red-500 font-medium">
        You must be logged in to view order details.
      </p>
    );
  }

  // ✅ Skeleton Loader
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          <Skeleton className="h-8 w-48" />
        </h2>

        <div className="p-4 sm:p-6 rounded-lg border space-y-6">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Skeleton className="h-5 w-28" />
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 border-b pb-3"
              >
                <Skeleton className="w-12 h-12" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <p className="p-6 text-center text-red-500 font-medium">{error}</p>
    );
  if (!order?._id)
    return (
      <p className="p-6 text-center text-gray-500">Order not found.</p>
    );

  const isAdminRoute = location.pathname.startsWith("/admin/orders");

  return (
   <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
    Order Details
  </h2>

  <div className="p-4 sm:p-6 rounded-lg border">
    {/* Order header */}
    <div className="flex flex-col sm:flex-row justify-between mb-6 sm:mb-8 gap-4">
      <div>
        <h3 className="text-base sm:text-lg md:text-xl font-semibold break-all">
          Order Id: #{order._id}
        </h3>
        <p className="text-gray-600 text-sm sm:text-base">
          {new Date(order.createdAt).toLocaleDateString()}{" "}
          {new Date(order.createdAt).toLocaleTimeString()}
        </p>
      </div>
      <div className="flex flex-col items-start sm:items-end gap-2">
        <span
          className={`${
            order.isPaid
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          } px-3 py-1 rounded-full text-xs sm:text-sm font-medium`}
        >
          {order.isPaid ? "Paid" : "Unpaid"}
        </span>
        <span
          className={`${
            order.orderStatus
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          } px-3 py-1 rounded-full text-xs sm:text-sm font-medium`}
        >
          {order.orderStatus}
        </span>
      </div>
    </div>

    {/* Customer Info */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-8">
      <div>
        <h4 className="text-base sm:text-lg font-semibold mb-2">
          Customer Info
        </h4>
        <p className="text-sm sm:text-base">Name: {order.user?.name || "N/A"}</p>
        <p className="text-sm sm:text-base">Email: {order.user?.email || "N/A"}</p>
        <p className="text-sm sm:text-base">Phone: {order.shippingAddress?.phone || "N/A"}</p>
      </div>

      <div>
        <h4 className="text-base sm:text-lg font-semibold mb-2">Payment Info</h4>
        <p className="text-sm sm:text-base">
          Method: {order.paymentMethod || order.paymentmethod}
        </p>
        <p className="text-sm sm:text-base">
          Status: {order.isPaid ? "Paid" : "Unpaid"}
        </p>
      </div>

      <div>
        <h4 className="text-base sm:text-lg font-semibold mb-2">Shipping Info</h4>
        <p className="text-sm sm:text-base break-words">
          Address: {order.shippingAddress?.address},{" "}
          {order.shippingAddress?.city},{" "}
          {order.shippingAddress?.country}
        </p>
        <p className="text-sm sm:text-base">
          Postal Code: {order.shippingAddress?.postalCode || "N/A"}
        </p>
      </div>
    </div>

  {/* Items Table */}
<div>
  <h4 className="text-base sm:text-lg font-semibold mb-4">Products</h4>
  <div className="overflow-x-auto -mx-2 sm:mx-0">
    <table className="min-w-full border border-gray-200 divide-y divide-gray-200 text-sm sm:text-base">
      <thead className="bg-gray-100">
        <tr>
          <th className="text-left px-3 sm:px-4 py-2 sm:py-3 min-w-[140px]">Name</th>
          <th className="text-left px-3 sm:px-4 py-2 sm:py-3 min-w-[90px]">Unit Price</th>
          <th className="text-left px-3 sm:px-4 py-2 sm:py-3 min-w-[80px]">Quantity</th>
          <th className="text-left px-3 sm:px-4 py-2 sm:py-3 min-w-[100px]">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {order.orderItems?.map((item) => (
          <tr key={item._id} className="align-top">
            {/* Name Cell */}
            <td className="px-3 sm:px-4 py-2 sm:py-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded border"
                />
                <span className="font-medium text-gray-800 break-words text-sm sm:text-base">
                  {item.name}
                </span>
              </div>
            </td>

            {/* Unit Price */}
            <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
              ${item.price.toFixed(2)}
            </td>

            {/* Quantity */}
            <td className="px-3 sm:px-4 py-2 sm:py-3">
              {item.qty || item.quantity}
            </td>

            {/* Total */}
            <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold whitespace-nowrap">
              ${(item.price * (item.qty || item.quantity)).toFixed(2)}
            </td>
          </tr>
        ))}
        <tr className="bg-gray-50">
          <td colSpan="3" className="px-3 sm:px-4 py-2 sm:py-3 text-right font-semibold">
            Subtotal:
          </td>
          <td className="px-3 sm:px-4 py-2 sm:py-3 font-bold">
            ${order.totalPrice?.toFixed(2)}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>


    {/* Conditional Back Link */}
    {isAdminRoute ? (
      <Link
        to="/admin"
        className="inline-block mt-6 text-blue-500 hover:underline"
      >
        ← Go Back to Dashboard
      </Link>
    ) : (
      <Link
        to="/my-order"
        className="inline-block mt-6 text-blue-500 hover:underline"
      >
        ← Back to My Orders
      </Link>
    )}
  </div>
</div>

  );
}

export default OrderDetailPage;
