// App.jsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Userlayout from "./components/layout/userlayout";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import { Toaster } from "sonner";
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
import { Provider, useDispatch } from "react-redux";
import store from "./redux/store";
import { fetchCart } from "./redux/slices/cartSlice";
import { useEffect } from "react";
import AdminRoute from "./components/AdminRoute";
import { syncAuthFromStorage } from "./redux/slices/authSlice";
// ✅ Proper wrapper to hook Redux + Router together
function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
      dispatch(syncAuthFromStorage()); 
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user._id) {
        console.log("🛒 Fetching cart for:", user._id);
        dispatch(fetchCart({ userId: user._id }));
      }
    } catch (err) {
      console.error("Failed to fetch user on reload", err);
    }
  }, []);

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

        <Route path="/admin" element={    <AdminRoute><ErrorBoundary><Adminlayout /></ErrorBoundary></AdminRoute>}>
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

// Final export
export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}
