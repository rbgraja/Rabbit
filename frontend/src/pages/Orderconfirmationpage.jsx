import React, { useEffect, useState } from 'react';

// ✅ Local Skeleton (reusable, same as other pages)
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />;
}

function Orderconfirmationpage() {
  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedOrder = localStorage.getItem("lastOrder");
    if (storedOrder) {
      const parsed = JSON.parse(storedOrder);
      setCheckout(parsed?.order);
    }
    setLoading(false);
  }, []);

  const calculateEstimatedDelivery = (createdAt) => {
    const orderDate = new Date(createdAt);
    orderDate.setDate(orderDate.getDate() + 10);
    return orderDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl sm:text-4xl font-bold text-center text-emerald-700 mb-6 sm:mb-8">
          <Skeleton className="h-10 w-2/3 mx-auto" />
        </h1>

        <div className="p-4 sm:p-6 rounded-lg border space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <Skeleton className="w-16 h-16" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
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
              Order Date: {new Date(checkout.createdAt).toLocaleTimeString()}
            </p>
          </div>

          <div>
            <p className="text-emerald-700 text-sm sm:text-base">
              Estimated Delivery: {calculateEstimatedDelivery(checkout.createdAt)}
            </p>
          </div>
        </div>

        {/* Order Items List */}
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
                  {item.color} | {item.size}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-md">${item.price}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Shipping & Payment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h4 className="text-md sm:text-lg font-semibold mb-2">Payment</h4>
            <p className="text-gray-600 text-sm sm:text-base">
              Cash on Delivery
            </p>
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
