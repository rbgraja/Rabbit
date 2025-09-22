import React, { useEffect, useState } from "react";
import namer from "color-namer";

// ✅ Local Skeleton
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />;
}

// 🔹 Format color object to friendly name
function formatColor(color) {
  if (!color) return "";

  // If color is object { name, hex }
  if (typeof color === "object") {
    return color.name || "Default";
  }

  // If string hex/rgb
  try {
    if (color.startsWith("#") || color.startsWith("rgb")) {
      const result = namer(color);
      return result.basic[0].name;
    }
    return color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
  } catch {
    return color;
  }
}

function Orderconfirmationpage() {
  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedOrder = localStorage.getItem("lastOrder");
    if (storedOrder) {
      const parsed = JSON.parse(storedOrder);
      setCheckout(parsed?.order || parsed); // support for different structures
    }
    setLoading(false);
  }, []);

  const calculateEstimatedDelivery = (createdAt) => {
    const orderDate = new Date(createdAt);
    orderDate.setDate(orderDate.getDate() + 10); // 10 days estimate
    return orderDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <Skeleton className="h-10 w-2/3 mx-auto" />
      </div>
    );
  }

  if (!checkout) {
    return <div className="p-6 text-center">No order found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white">
      <h1 className="text-2xl sm:text-4xl font-bold text-center text-emerald-700 mb-6 sm:mb-8">
        Thank you for your order
      </h1>

      <div className="p-4 sm:p-6 rounded-lg border">
        {/* Order Info */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-10 sm:mb-20 gap-4 sm:gap-0">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">
              Order ID: {checkout._id}
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              Order Date: {new Date(checkout.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-emerald-700 text-sm sm:text-base">
              Estimated Delivery: {calculateEstimatedDelivery(checkout.createdAt)}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-10 sm:mb-20 space-y-4">
          {checkout.orderItems?.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center gap-4 border-b pb-4"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-md"
              />
              <div className="flex-1">
                <h4 className="text-md font-semibold">{item.name}</h4>
                <p className="text-sm text-gray-500">
                  {formatColor(item.color)} | {item.size}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-md">${item.price}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Shipping & Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h4 className="text-md sm:text-lg font-semibold mb-2">Payment</h4>
            <p className="text-gray-600 text-sm sm:text-base">Cash on Delivery</p>
          </div>
          <div>
            <h4 className="text-md sm:text-lg font-semibold mb-2">Delivery</h4>
            <p className="text-gray-600 text-sm sm:text-base">
              {checkout.shippingAddress?.address}
            </p>
            <p className="text-gray-600 text-sm sm:text-base">
              {checkout.shippingAddress?.city}, {checkout.shippingAddress?.country}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orderconfirmationpage;
