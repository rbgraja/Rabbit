import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, updateCartQuantityAsync, removeFromCartAsync } from "../../redux/slices/cartSlice";
import { RiDeleteBin3Line } from "react-icons/ri";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function formatColor(color) {
  if (!color) return "N/A";
  if (typeof color === "string") return color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
  if (typeof color === "object") return color.name || color.hex || "N/A";
  return "N/A";
}

function CardContent() {
  const dispatch = useDispatch();
  const { cartItems = [], loading } = useSelector((state) => state.cart || {});

  const generateGuestId = () => {
    const existing = localStorage.getItem("guestId");
    if (existing) return existing;
    const id = "guest_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("guestId", id);
    return id;
  };

  const guestId = generateGuestId();
  const userId = null;

  useEffect(() => {
    dispatch(fetchCart({ guestId, userId }));
  }, [dispatch, guestId, userId]);

  const increaseQuantity = (item) => {
    dispatch(updateCartQuantityAsync({ ...item, quantity: item.quantity + 1, guestId, userId }));
  };

  const decreaseQuantity = (item) => {
    if (item.quantity === 1) deleteProduct(item);
    else dispatch(updateCartQuantityAsync({ ...item, quantity: item.quantity - 1, guestId, userId }));
  };

  const deleteProduct = (item) => {
    dispatch(removeFromCartAsync({ ...item, guestId, userId }));
  };

  if (loading) return <Skeleton count={3} height={100} />;

  if (!cartItems.length) return <p className="text-center mt-6 text-gray-500">Your cart is empty.</p>;

  return (
    <div>
      {cartItems.map((product) => (
        <div key={`${product.productId}-${product.size}-${JSON.stringify(product.color)}`} className="flex items-start justify-between py-4 border-b">
          <div className="flex items-start">
            <img src={product.image || "https://via.placeholder.com/150"} alt={product.name || "Product"} className="w-20 h-24 object-cover mr-4 rounded" />
            <div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                Size: {product.size} | Color: {formatColor(product.color)}
                <span className="w-5 h-5 rounded-full border" style={{ backgroundColor: product.color?.hex || "#ccc" }} />
              </p>
              <div className="flex items-center mt-2">
                <button onClick={() => decreaseQuantity(product)} className="border rounded px-2 py-1 text-xl">-</button>
                <span className="mx-3">{product.quantity}</span>
                <button onClick={() => increaseQuantity(product)} className="border rounded px-2 py-1 text-xl">+</button>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p>${(Number(product.price) * Number(product.quantity)).toFixed(2)}</p>
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
