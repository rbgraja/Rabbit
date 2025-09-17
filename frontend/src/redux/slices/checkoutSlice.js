// src/redux/slices/checkoutSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Backend API base URL
const BASE_URL = import.meta.env.VITE_BACKGROUND_URL;

// ✅ Load checkout from localStorage
const loadCheckoutFromStorage = () => {
  try {
    const stored = localStorage.getItem("checkout");
    return stored
      ? JSON.parse(stored)
      : {
          checkoutItems: [],
          shippingAddress: {},
          paymentMethod: "",
          totalPrice: 0,
        };
  } catch (error) {
    console.error("Failed to parse checkout from localStorage:", error);
    return {
      checkoutItems: [],
      shippingAddress: {},
      paymentMethod: "",
      totalPrice: 0,
    };
  }
};

// ✅ Save to localStorage
const saveCheckoutToStorage = (state) => {
  localStorage.setItem(
    "checkout",
    JSON.stringify({
      checkoutItems: state.checkoutItems,
      shippingAddress: state.shippingAddress,
      paymentMethod: state.paymentMethod,
      totalPrice: state.totalPrice,
    })
  );
};

/* ---------------------- Async Thunks ---------------------- */

// 📥 Fetch user's checkout
export const fetchCheckout = createAsyncThunk(
  "checkout/fetchCheckout",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/checkout/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch checkout"
      );
    }
  }
);

// 📝 Create or update checkout
export const createCheckout = createAsyncThunk(
  "checkout/createCheckout",
  async (checkoutData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/checkout`, checkoutData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create checkout"
      );
    }
  }
);

// ❌ Clear checkout
export const clearCheckout = createAsyncThunk(
  "checkout/clearCheckout",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/checkout/clear`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to clear checkout"
      );
    }
  }
);

/* ---------------------- Redux Slice ---------------------- */

const checkoutSlice = createSlice({
  name: "checkout",
  initialState: {
    ...loadCheckoutFromStorage(),
    loading: false,
    error: null,
  },
  reducers: {
    setCheckoutState(state, action) {
      state.checkoutItems = action.payload.checkoutItems;
      state.shippingAddress = action.payload.shippingAddress;
      state.paymentMethod = action.payload.paymentMethod;
      state.totalPrice = action.payload.totalPrice;
      saveCheckoutToStorage(state);
    },
  },
  extraReducers: (builder) => {
    builder

      // 📥 Fetch
      .addCase(fetchCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkoutItems = action.payload.checkoutItems || [];
        state.shippingAddress = action.payload.shippingAddress || {};
        state.paymentMethod = action.payload.paymentMethod || "";
        state.totalPrice = action.payload.totalPrice || 0;
        saveCheckoutToStorage(state);
      })
      .addCase(fetchCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 📝 Create/Update
      .addCase(createCheckout.fulfilled, (state, action) => {
        state.checkoutItems = action.payload.checkoutItems;
        state.shippingAddress = action.payload.shippingAddress;
        state.paymentMethod = action.payload.paymentMethod;
        state.totalPrice = action.payload.totalPrice;
        saveCheckoutToStorage(state);
      })
      .addCase(createCheckout.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ❌ Clear
      .addCase(clearCheckout.fulfilled, (state) => {
        state.checkoutItems = [];
        state.shippingAddress = {};
        state.paymentMethod = "";
        state.totalPrice = 0;
        saveCheckoutToStorage(state);
      })
      .addCase(clearCheckout.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setCheckoutState } = checkoutSlice.actions;
export default checkoutSlice.reducer;
