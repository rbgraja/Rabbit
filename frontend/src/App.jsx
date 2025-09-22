import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { useEffect } from "react";

import store from "./redux/store";
import { fetchCart, setCartFromStorage } from "./redux/slices/cartSlice";
import { syncAuthFromStorage } from "./redux/slices/authSlice";

import Userlayout from "./components/layout/userlayout";
import ErrorBoundary from "./components/ErrorBoundary";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Collectionpage from "./pages/Collectionpage";
import Productdetail from "./components/products/Productdetail";
import Checkout from "./components/carts/Checkout";
import Orderconfirmationpage from "./pages/Orderconfirmationpage";
import OrderDetailpage from "./pages/OrderDetailpage";
import Myorder from "./pages/Myorder";
import Adminlayout from "./components/admin/Adminlayout";
import Adminhomepage from "./pages/Adminhomepage";
import Usermanagement from "./components/admin/Usermanagement";
import Productmanagement from "./components/admin/Productmanagement";
import Handleedit from "./components/admin/Handleedit";
import OrderManagement from "./components/admin/Ordermanagement";
import { Toaster } from "sonner";

function AppContent() {
  const dispatch = useDispatch();

useEffect(() => {
  dispatch(syncAuthFromStorage());

  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const storedCart = JSON.parse(localStorage.getItem("cart"));

    // 1️⃣ LocalStorage me agar cart items hain → set Redux state
    if (storedCart?.cartItems?.length > 0) {
      dispatch(setCartFromStorage(storedCart));
    }

    // 2️⃣ Agar user logged in → server fetch
    if (user && user._id) {
      dispatch(fetchCart({ userId: user._id }))
        .unwrap()
        .then((serverCart) => {
          // server cart me items hain → Redux state update
          if (serverCart?.products?.length > 0) {
            dispatch(setCartFromStorage(serverCart));
          } 
          // agar server cart empty hai → Redux state localStorage se already hydrated hai
        })
        .catch(() => {
          console.warn("Server cart fetch failed, using localStorage cart if available");
        });
    }
  } catch (err) {
    console.error("Failed to fetch user/cart on reload:", err);
  }
}, [dispatch]);


  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Userlayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<Profile />} />
          <Route path="collection" element={<Collectionpage />} />
          <Route path="product/:id" element={<Productdetail />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation" element={<Orderconfirmationpage />} />
          <Route path="order/:id" element={<OrderDetailpage />} />
          <Route path="my-order" element={<Myorder />} />
        </Route>

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <ErrorBoundary>
                <Adminlayout />
              </ErrorBoundary>
            </AdminRoute>
          }
        >
          <Route index element={<Adminhomepage />} />
          <Route path="users" element={<Usermanagement />} />
          <Route path="products" element={<Productmanagement />} />
          <Route path="products/:id/edit" element={<Handleedit />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="orders/:id" element={<OrderDetailpage />} />
          <Route path="/admin/products/add" element={<Handleedit />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}
