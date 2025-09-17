import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKGROUND_URL;

// Normalize utility
const normalize = (value) => value?.trim().toLowerCase();

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem("cart");
    return stored
      ? JSON.parse(stored)
      : { cartItems: [], totalQuantity: 0, totalPrice: 0 };
  } catch {
    return { cartItems: [], totalQuantity: 0, totalPrice: 0 };
  }
};

// Save cart to localStorage
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

// Auth headers for requests
const getAuthHeaders = () => {
  const token = localStorage.getItem("userToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Set cart state from backend response
const setCartFromResponse = (state, payload) => {
  const cartItems = payload.products || [];
  const totalPrice = payload.totalPrice || 0;
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  state.cartItems = cartItems;
  state.totalPrice = totalPrice;
  state.totalQuantity = totalQuantity;

  // ✅ only save if cart has items
  if (cartItems.length > 0) {
    saveCartToStorage(state);
  }
};

/* -------------------
   ✅ Async Thunks
-------------------- */

// Fetch cart
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

// Add to cart
export const addToCartAsync = createAsyncThunk(
  "cart/addToCart",
  async (item, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/cart`,
        {
          ...item,
          size: normalize(item.size),
          color: normalize(item.color),
        },
        { headers: getAuthHeaders() }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add to cart");
    }
  }
);

// Update quantity
export const updateCartQuantityAsync = createAsyncThunk(
  "cart/updateQuantity",
  async ({ productId, size, color, quantity, userId, guestId }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/api/cart`,
        {
          productId,
          size: normalize(size),
          color: normalize(color),
          quantity,
          userId,
          guestId,
        },
        { headers: getAuthHeaders() }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update quantity");
    }
  }
);

// Remove item
export const removeFromCartAsync = createAsyncThunk(
  "cart/removeFromCart",
  async ({ productId, size, color, userId, guestId }, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${BASE_URL}/api/cart`, {
        headers: getAuthHeaders(),
        data: {
          productId,
          size: normalize(size),
          color: normalize(color),
          userId,
          guestId,
        },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove item");
    }
  }
);

// Merge guest cart on login
export const mergeGuestCartOnLogin = createAsyncThunk(
  "cart/mergeGuestCartOnLogin",
  async ({ userId, guestCart }, { rejectWithValue }) => {
    try {
      const guestId = localStorage.getItem("guestId");

      const res = await axios.post(
        `${BASE_URL}/api/cart/merge`,
        { guestId, guestCart },
        { headers: getAuthHeaders() }
      );

      return {
        cart: res.data.cart,
        shouldClearGuest: true,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to merge cart");
    }
  }
);

// Clear cart after checkout
export const clearServerCart = createAsyncThunk(
  "cart/clearServerCart",
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/api/cart/clear`, {
        headers: getAuthHeaders(),
      });
      return true;
    } catch (err) {
      return rejectWithValue("Failed to clear cart after checkout");
    }
  }
);

/* --------------------------
   🧠 Cart Slice
--------------------------- */

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    ...loadCartFromStorage(),
    loading: false,
    error: null,
    checkoutCompleted: false,
  },
  reducers: {
    clearCartState: (state) => {
      state.cartItems = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      state.checkoutCompleted = false;
      localStorage.removeItem("cart");
    },
    markCheckoutCompleted: (state) => {
      state.checkoutCompleted = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.products?.length > 0) {
          setCartFromResponse(state, action.payload);
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addToCartAsync.fulfilled, (state, action) => {
        setCartFromResponse(state, action.payload);
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(updateCartQuantityAsync.fulfilled, (state, action) => {
        setCartFromResponse(state, action.payload);
      })
      .addCase(updateCartQuantityAsync.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        setCartFromResponse(state, action.payload);
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(mergeGuestCartOnLogin.fulfilled, (state, action) => {
        const { cart, shouldClearGuest } = action.payload;
        setCartFromResponse(state, cart);

        if (shouldClearGuest) {
          localStorage.removeItem("guestId");
          localStorage.removeItem("cart");
        }
      })
      .addCase(mergeGuestCartOnLogin.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(clearServerCart.fulfilled, (state) => {
        state.cartItems = [];
        state.totalQuantity = 0;
        state.totalPrice = 0;
        state.checkoutCompleted = true;
        localStorage.removeItem("cart");
      });
  },
});

/* --------------------------
   ✨ Exports
--------------------------- */

export const { clearCartState, markCheckoutCompleted } = cartSlice.actions;
export default cartSlice.reducer;
