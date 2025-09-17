// src/redux/slices/orderSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKGROUND_URL;

// ✅ Helper to get token from Redux arg or localStorage
const getToken = (passedToken) => {
  return passedToken || localStorage.getItem("userToken");
};

/* ---------------------- Async Thunks ---------------------- */

// 📦 Fetch all orders
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async ({ isAdmin = false, token }, { rejectWithValue }) => {
    console.log("Fetching orders with token:", token);

    try {
      token = getToken(token);
      const endpoint = isAdmin ? "/api/admin/orders" : "/api/orders/my-order";

      const res = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ Always return array
      return res.data.orders || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);


// 📥 Fetch order detail by ID
export const fetchOrderDetailById = createAsyncThunk(
  "orders/fetchOrderDetailById",
  async ({ orderId, token, isAdmin = false }, { rejectWithValue }) => {
    try {
      // Agar parameter me token nahi mila to localStorage se le lo
      token = token || localStorage.getItem("userToken"); // ✅ match storage key

      const endpoint = isAdmin
        ? `/api/admin/orders/${orderId}`
        : `/api/orders/${orderId}`;

      const res = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data?.order || res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch order detail"
      );
    }
  }
);



// 🆕 Create a new order
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async ({ orderData, token }, { rejectWithValue }) => {
    try {
      token = getToken(token);
      const res = await axios.post(`${BASE_URL}/api/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create order"
      );
    }
  }
);

// 🔄 Update order status (admin)
export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ orderId, status, token }, { rejectWithValue }) => {
    try {
      token = getToken(token);
      const res = await axios.put(
        `${BASE_URL}/api/admin/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update order status"
      );
    }
  }
);

/* ---------------------- Initial State ---------------------- */

const initialState = {
  orders: [],
  orderDetail: null,
  loading: false,
  error: null,
};

/* ---------------------- Slice ---------------------- */

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrders(state) {
      state.orders = [];
      state.orderDetail = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // 📥 Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 📥 Fetch order detail by ID
      .addCase(fetchOrderDetailById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.orderDetail = null;
      })
      .addCase(fetchOrderDetailById.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetail = action.payload;
      })
      .addCase(fetchOrderDetailById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.orderDetail = null;
      })

      // 🆕 Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔄 Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload;
        const index = state.orders.findIndex((o) => o._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrders } = orderSlice.actions;
export default orderSlice.reducer;
