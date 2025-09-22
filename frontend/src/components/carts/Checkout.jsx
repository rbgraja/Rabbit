import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { clearCartState } from '../../redux/slices/cartSlice';

// ✅ Simple Skeleton Component (direct yahi file me use karenge)
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems, totalPrice } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [justCheckedOut, setJustCheckedOut] = useState(false);
  const [loading, setLoading] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    firstname: '',
    lastname: '',
    address: '',
    city: '',
    postalcode: '',
    country: '',
    phone: '',
  });

  useEffect(() => {
    if ((!cartItems || cartItems.length === 0) && !justCheckedOut) {
      navigate('/');
    }
  }, [cartItems, navigate, justCheckedOut]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        alert("Session expired. Please login again.");
        return navigate("/login");
      }

      const orderData = {
        orderItems: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        shippingAddress,
        paymentmethod: 'Cash on Delivery',
        totalPrice,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_BACKGROUND_URL}/api/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const orderResponse = {
        ...res.data,
        createdAt: res.data.createdAt || new Date().toISOString(),
      };

      localStorage.setItem('lastOrder', JSON.stringify(orderResponse));
      dispatch(clearCartState());
      setJustCheckedOut(true);
      navigate('/order-confirmation');
    } catch (err) {
      console.error('Checkout error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Something went wrong during checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter">
      {/* Left: Form */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl uppercase mb-6">Checkout</h2>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder}>
            <h3 className="text-lg mb-4">Contact Details</h3>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full p-2 border rounded bg-gray-100"
                disabled
              />
            </div>

            <h3 className="text-lg mb-4">Delivery</h3>
            <div className="mb-4 grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="First Name"
                className="p-2 border rounded"
                value={shippingAddress.firstname}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, firstname: e.target.value })
                }
              />
              <input
                type="text"
                required
                placeholder="Last Name"
                className="p-2 border rounded"
                value={shippingAddress.lastname}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, lastname: e.target.value })
                }
              />
            </div>

            <input
              type="text"
              required
              placeholder="Address"
              className="w-full mb-4 p-2 border rounded"
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, address: e.target.value })
              }
            />

            <div className="mb-4 grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="City"
                className="p-2 border rounded"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, city: e.target.value })
                }
              />
              <input
                type="text"
                required
                placeholder="Postal Code"
                className="p-2 border rounded"
                value={shippingAddress.postalcode}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, postalcode: e.target.value })
                }
              />
            </div>

            <input
              type="text"
              required
              placeholder="Country"
              className="w-full mb-4 p-2 border rounded"
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, country: e.target.value })
              }
            />

            <input
              type="tel"
              required
              placeholder="Phone"
              className="w-full mb-6 p-2 border rounded"
              value={shippingAddress.phone}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, phone: e.target.value })
              }
            />

            <div className="mt-6">
              <button
                className="w-full bg-black text-white py-3 rounded hover:bg-gray-800"
                disabled={loading}
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Right: Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg mb-4">Order Summary</h3>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
<div className="border-t py-4 mb-4">
  {cartItems?.map((product, index) => (
    <div
      key={index}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b"
    >
      {/* Product Info */}
      <div className="flex flex-col sm:flex-row sm:items-center">
        <img
          src={product?.image}
          alt={product?.name}
          className="w-20 h-24 object-cover mb-3 sm:mb-0 sm:mr-4"
        />
        <div>
          <h3 className="text-md font-medium">{product?.name}</h3>
          <p className="text-gray-500">Size: {product?.size}</p>
          <p className="text-gray-500">Color: {product?.color}</p>
          <p className="text-gray-500">Qty: {product?.quantity}</p>
        </div>
      </div>

      {/* Price */}
      <p className="text-lg font-semibold mt-2 sm:mt-0">
        ${product?.price?.toFixed(2)}
      </p>
    </div>
  ))}
</div>

            <div className="flex justify-between text-lg mb-4">
              <p>Subtotal</p>
              <p>${Number(totalPrice || 0).toLocaleString()}</p>
            </div>
            <div className="flex justify-between text-lg">
              <p>Shipping</p>
              <p>Free</p>
            </div>
            <div className="flex justify-between text-lg mt-4 border-t pt-4">
              <p>Total</p>
              <p>${Number(totalPrice || 0).toLocaleString()}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Checkout;
