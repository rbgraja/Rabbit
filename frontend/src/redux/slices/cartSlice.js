import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKGROUND_URL;

// --------------------------
// Utility Functions
// --------------------------
const normalize = (value) => value?.trim().toLowerCase() || "default";

const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem("cart");
    if (!stored) return { cartItems: [], totalQuantity: 0, totalPrice: 0 };
    const parsed = JSON.parse(stored);
    return {
      cartItems: parsed.cartItems || [],
      totalQuantity: parsed.totalQuantity || 0,
      totalPrice: parsed.totalPrice || 0,
    };
  } catch {
    return { cartItems: [], totalQuantity: 0, totalPrice: 0 };
  }
};

const saveCartToStorage = (state) => {
  localStorage.setItem(
    "cart",
    JSON.stringify({
      cartItems: state.cartItems,
      totalQuantity: state.totalQuantity,
      totalPrice: state.totalPrice,
    })
  );
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("userToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatColor = (color) => {
  if (!color) return { name: "Default", hex: "#ccc" };
  if (typeof color === "object") return { name: color.name || "Default", hex: color.hex || "#ccc" };
  return { name: color, hex: color };
};

// --------------------------
// Reducer Helpers
// --------------------------
export const setCartFromResponse = (state, payload = {}) => {
  const cartItems = Array.isArray(payload.products)
    ? payload.products.map(item => ({
        ...item,
        color: formatColor(item.color),
        size: normalize(item.size),
        quantity: item.quantity || 1,
      }))
    : [];

  const totalPrice = typeof payload.totalPrice === "number" ? payload.totalPrice : 0;
  const totalQuantity = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);

  state.cartItems = cartItems;
  state.totalPrice = totalPrice;
  state.totalQuantity = totalQuantity;

  saveCartToStorage(state);
};

// --------------------------
// Async Thunks
// --------------------------
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async ({ userId, guestId } = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/cart`, {
        params: userId ? { userId } : { guestId },
        headers: getAuthHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch cart");
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  "cart/addToCart",
  async (item, { rejectWithValue }) => {
    try {
      const payload = {
        ...item,
        size: normalize(item.size),
        color: formatColor(item.color),
        quantity: item.quantity || 1,
      };
      const res = await axios.post(`${BASE_URL}/api/cart`, payload, { headers: getAuthHeaders() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add to cart");
    }
  }
);

export const updateCartQuantityAsync = createAsyncThunk(
  "cart/updateQuantity",
  async ({ productId, size, color, quantity, userId, guestId }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/api/cart`,
        { productId, size: normalize(size), color: formatColor(color), quantity, userId, guestId },
        { headers: getAuthHeaders() }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update quantity");
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  "cart/removeFromCart",
  async ({ productId, size, color, userId, guestId }, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${BASE_URL}/api/cart`, {
        headers: getAuthHeaders(),
        data: { productId, size: normalize(size), color: formatColor(color), userId, guestId },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove item");
    }
  }
);

export const mergeGuestCartOnLogin = createAsyncThunk(
  "cart/mergeGuestCartOnLogin",
  async ({ userId, guestCart }, { rejectWithValue }) => {
    try {
      const guestId = localStorage.getItem("guestId");
      const res = await axios.post(`${BASE_URL}/api/cart/merge`, { guestId, guestCart }, { headers: getAuthHeaders() });
      return { cart: res.data.cart };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to merge cart");
    }
  }
);

// --------------------------
// Slice
// --------------------------
const initialState = {
  cartItems: [],
  totalQuantity: 0,
  totalPrice: 0,
  loading: false,
  error: null,
  checkoutCompleted: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState: { ...initialState, ...loadCartFromStorage() },
  reducers: {
    clearCartState: (state) => {
      // Redux reset
      state.cartItems = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      state.checkoutCompleted = false;

      // LocalStorage remove sirf agar cart me items hain
      if (state.cartItems.length > 0) localStorage.removeItem("cart");
    },
    markCheckoutCompleted: (state) => {
      state.checkoutCompleted = true;
    },
    setCartFromStorage: (state, action) => {
      const stored = action.payload;
      if (!stored || !stored.cartItems || stored.cartItems.length === 0) return; // sirf agar items hain
      state.cartItems = stored.cartItems;
      state.totalQuantity = stored.totalQuantity || 0;
      state.totalPrice = stored.totalPrice || 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.products?.length > 0) setCartFromResponse(state, action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload || "Failed to fetch cart"; })

      .addCase(addToCartAsync.fulfilled, (state, action) => setCartFromResponse(state, action.payload))
      .addCase(addToCartAsync.rejected, (state, action) => { state.error = action.payload || "Failed to add item"; })

      .addCase(updateCartQuantityAsync.fulfilled, (state, action) => setCartFromResponse(state, action.payload))
      .addCase(updateCartQuantityAsync.rejected, (state, action) => { state.error = action.payload || "Failed to update quantity"; })

      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        if (action.payload?.products?.length >= 0) setCartFromResponse(state, action.payload);
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => { state.error = action.payload || "Failed to remove item"; })

      .addCase(mergeGuestCartOnLogin.fulfilled, (state, action) => {
        if (action.payload?.cart?.products?.length > 0) setCartFromResponse(state, action.payload.cart);
      })
      .addCase(mergeGuestCartOnLogin.rejected, (state, action) => { state.error = action.payload || "Failed to merge cart"; });
  },
});

export const { clearCartState, markCheckoutCompleted, setCartFromStorage } = cartSlice.actions;
export default cartSlice.reducer;
