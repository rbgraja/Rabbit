import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import login from "../assets/login.webp";
import { loginUser } from "../redux/slices/authSlice";
import { fetchCart, mergeGuestCartOnLogin } from "../redux/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";

function Login() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, guestId, error: loginError, loading } = useSelector(
    (state) => state.auth
  );
  const { cartItems } = useSelector((state) => state.cart);

  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirect.includes("checkout");

  useEffect(() => {
    const syncCartAfterLogin = async () => {
      if (user) {
        const guestCart =
          JSON.parse(localStorage.getItem("cart"))?.cartItems || [];

        if (guestCart.length > 0 && guestId) {
          await dispatch(
            mergeGuestCartOnLogin({
              userId: user._id,
              guestCart,
              guestId,
            })
          );
          localStorage.removeItem("cart");
          localStorage.removeItem("guestId");
        }

        await dispatch(fetchCart({ userId: user._id }));

        navigate(isCheckoutRedirect ? "/checkout" : "/");
      }
    };

    syncCartAfterLogin();
  }, [user, guestId, dispatch, isCheckoutRedirect, navigate]);

  const handlesubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="flex">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
        <form
          onSubmit={handlesubmit}
          className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm"
        >
          <div className="flex justify-center mb-6">
            <h2 className="text-xl font-medium">Rabbit</h2>
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">Hey There! 👋</h2>
          <p className="text-center mb-4">
            Enter your username and password to Login
          </p>

          {loginError && (
            <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded border border-red-300 text-sm">
              ⚠️ {loginError}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your email address"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`bg-black w-full text-white p-2 rounded-lg font-semibold transition-all ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:border-s-gray-800"
            }`}
          >
            {loading ? "Loading..." : "Sign In"}
          </button>

          <p className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link
              to={`/register?redirect=${encodeURIComponent(redirect)}`}
              className="text-blue-500"
            >
              Register
            </Link>
          </p>
        </form>
      </div>

      <div className="hidden md:block w-1/2 bg-gray-800">
        <div className="h-full flex flex-col justify-center items-center">
          <img
            src={login}
            alt="login to account"
            className="h-[750px] w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
