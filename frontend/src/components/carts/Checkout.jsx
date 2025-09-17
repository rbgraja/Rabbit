import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { clearCartState } from '../../redux/slices/cartSlice';

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems, totalPrice } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [justCheckedOut, setJustCheckedOut] = useState(false);

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

    // ✅ Store the order with fallback createdAt
    const orderResponse = {
      ...res.data,
      createdAt: res.data.createdAt || new Date().toISOString(),
    };

    localStorage.setItem('lastOrder', JSON.stringify(orderResponse));
    console.log('Full order response:', res.data);
    dispatch(clearCartState());
    setJustCheckedOut(true);
    navigate('/order-confirmation');
  } catch (err) {
    console.error('Checkout error:', err.response?.data || err.message);
    alert(err.response?.data?.message || 'Something went wrong during checkout.');
  }
  
};


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter">
      {/* Left: Form */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl uppercase mb-6">Checkout</h2>
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
            <button className="w-full bg-black text-white py-3 rounded hover:bg-gray-800">
              Place Order
            </button>
          </div>
        </form>
      </div>

      {/* Right: Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg mb-4">Order Summary</h3>
        <div className="border-t py-4 mb-4">
          {cartItems?.map((product, index) => (
            <div key={index} className="flex items-start justify-between py-2 border-b">
              <div className="flex items-start">
                <img
                  src={product?.image}
                  alt={product?.name}
                  className="w-20 h-24 object-cover mr-4"
                />
                <div>
                  <h3 className="text-md">{product?.name}</h3>
                  <p className="text-gray-500">Size: {product?.size}</p>
                  <p className="text-gray-500">Color: {product?.color}</p>
                  <p className="text-gray-500">Qty: {product?.quantity}</p>
                </div>
              </div>
              <p className="text-xl">${product?.price?.toFixed(2)}</p>
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
      </div>
    </div>
  );
}

export default Checkout;
