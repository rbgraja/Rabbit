import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  updateCartQuantityAsync,
  removeFromCartAsync,
} from "../../redux/slices/cartSlice";
import { RiDeleteBin3Line } from "react-icons/ri";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function CardContent() {
  const dispatch = useDispatch();
  const { cartItems = [], loading } = useSelector((state) => state.cart);

  // ✅ Generate guestId only once
  const generateGuestId = () => {
    const existing = localStorage.getItem("guestId");
    if (existing) return existing;
    const id = "guest_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("guestId", id);
    return id;
  };

  const guestId = generateGuestId();
  const userId = null; // Or pass actual user ID if logged in

  // ✅ Fetch cart on first load
  useEffect(() => {
    dispatch(fetchCart({ guestId, userId }));
  }, [dispatch]);

  // ✅ Increase quantity
  const increaseQuantity = (item) => {
    dispatch(
      updateCartQuantityAsync({
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity + 1,
        guestId,
        userId,
      })
    );
  };

  // ✅ Decrease or remove
  const decreaseQuantity = (item) => {
    if (item.quantity === 1) {
      deleteProduct(item);
    } else {
      dispatch(
        updateCartQuantityAsync({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity - 1,
          guestId,
          userId,
        })
      );
    }
  };

  // ✅ Delete
  const deleteProduct = (item) => {
    dispatch(
      removeFromCartAsync({
        productId: item.productId,
        size: item.size,
        color: item.color,
        guestId,
        userId,
      })
    );
  };

  // ✅ Skeleton Loader while cart loading
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start justify-between border-b pb-4">
            <div className="flex items-start">
              <Skeleton width={80} height={100} className="mr-4 rounded" />
              <div>
                <Skeleton width={120} height={20} />
                <Skeleton width={80} height={15} className="mt-2" />
                <div className="flex items-center mt-3 space-x-2">
                  <Skeleton width={30} height={30} />
                  <Skeleton width={20} height={20} />
                  <Skeleton width={30} height={30} />
                </div>
              </div>
            </div>
            <div className="text-right">
              <Skeleton width={60} height={20} />
              <Skeleton circle width={24} height={24} className="mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!cartItems.length) {
    return <p className="text-center mt-6 text-gray-500">Your cart is empty.</p>;
  }

  return (
    <div>
      {cartItems.map((product) => (
        <div
          key={`${product.productId}-${product.size}-${product.color}`}
          className="flex items-start justify-between py-4 border-b"
        >
          {/* 🖼️ Image + Info */}
          <div className="flex items-start">
            <img
              src={product.image || "https://via.placeholder.com/150"}
              alt={product.name || "Product"}
              className="w-20 h-24 object-cover mr-4 rounded"
            />
            <div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-500">
                Size: {product.size} | Color: {product.color}
              </p>

              {/* ➕➖ Quantity */}
              <div className="flex items-center mt-2">
                <button
                  onClick={() => decreaseQuantity(product)}
                  className="border rounded px-2 py-1 text-xl"
                >
                  -
                </button>
                <span className="mx-3">{product.quantity}</span>
                <button
                  onClick={() => increaseQuantity(product)}
                  className="border rounded px-2 py-1 text-xl"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 💲 Price + Delete */}
          <div className="text-right">
            <p>
              $ {(Number(product.price) * Number(product.quantity)).toFixed(2)}
            </p>
            <button onClick={() => deleteProduct(product)}>
              <RiDeleteBin3Line className="h-6 w-6 mt-2 text-red-500 hover:text-red-700" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CardContent;
