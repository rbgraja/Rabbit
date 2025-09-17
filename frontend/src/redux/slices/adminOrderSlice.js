import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKGROUND_URL;

/* ------------------ Async Thunks ------------------ */

// 📥 Get all orders
export const fetchAdminOrders = createAsyncThunk(
  "adminOrders/fetchAll",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().user?.user?.token || localStorage.getItem("userToken");
      const res = await axios.get(`${BASE_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data?.orders || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch orders");
    }
  }
);

// 🔎 Get single order by ID
export const getAdminOrderById = createAsyncThunk(
  "adminOrders/getById",
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().user?.user?.token || localStorage.getItem("userToken");
      const res = await axios.get(`${BASE_URL}/api/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data?.order || null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch order detail");
    }
  }
);

// 🟡 Update order status
export const updateOrderStatus = createAsyncThunk(
  "adminOrders/updateStatus",
  async ({ id, status }, { rejectWithValue, getState }) => {
    try {
      const token = getState().user?.user?.token || localStorage.getItem("userToken");
      const res = await axios.put(
        `${BASE_URL}/api/admin/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data?.order || null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update status");
    }
  }
);

// 🟢 Update payment status (isPaid)
export const updateOrderPaymentStatus = createAsyncThunk(
  "adminOrders/updatePaymentStatus",
  async ({ id, isPaid }, { rejectWithValue, getState }) => {
    try {
      const token = getState().user?.user?.token || localStorage.getItem("userToken");
      const res = await axios.put(
        `${BASE_URL}/api/admin/orders/${id}/payment`,
        { isPaid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data?.order || null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update payment status");
    }
  }
);

// ❌ Delete an order
export const deleteOrderById = createAsyncThunk(
  "adminOrders/delete",
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().user?.user?.token || localStorage.getItem("userToken");
      if (!token) throw new Error("No token found");

      await axios.delete(`${BASE_URL}/api/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to delete order");
    }
  }
);

/* ------------------ Slice ------------------ */

const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState: {
    orders: [],
    orderDetail: null,
    totalRevenue: 0,
    totalProfit: 0,
    totalSales: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminOrderError(state) {
      state.error = null;
    },
    clearOrderDetail(state) {
      state.orderDetail = null;
    },
    calculateSummary(state) {
      if (!Array.isArray(state.orders)) {
        state.orders = [];
      }

      const deliveredOrders = state.orders.filter((o) => o?.orderStatus === "Delivered");

      state.totalSales = deliveredOrders.length || 0;

      state.totalRevenue = deliveredOrders.reduce((acc, order) => {
        return acc + (order?.totalPrice || 0);
      }, 0);

      // Optional: Assuming profit = 20% of revenue (for demo purpose)
      state.totalProfit = Math.round(state.totalRevenue * 0.2);
    },
  },
  extraReducers: (builder) => {
    builder

      // 📥 All orders
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
        adminOrderSlice.caseReducers.calculateSummary(state); // 👈 auto calculate on fetch
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.orders = [];
      })

      // 🔎 Single order
      .addCase(getAdminOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.orderDetail = null;
      })
      .addCase(getAdminOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetail = action.payload;
      })
      .addCase(getAdminOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.orderDetail = null;
      })

      // 🟡 Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.orders.findIndex((o) => o._id === action.payload._id);
          if (index !== -1) {
            state.orders[index] = action.payload;
          }
          if (state.orderDetail && state.orderDetail._id === action.payload._id) {
            state.orderDetail = action.payload;
          }
        }
        adminOrderSlice.caseReducers.calculateSummary(state);
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🟢 Update payment status
      .addCase(updateOrderPaymentStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrderPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.orders.findIndex((o) => o._id === action.payload._id);
          if (index !== -1) {
            state.orders[index] = action.payload;
          }
          if (state.orderDetail && state.orderDetail._id === action.payload._id) {
            state.orderDetail = action.payload;
          }
        }
        adminOrderSlice.caseReducers.calculateSummary(state);
      })
      .addCase(updateOrderPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ❌ Delete order
      .addCase(deleteOrderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter((o) => o._id !== action.payload);
        adminOrderSlice.caseReducers.calculateSummary(state);
      })
      .addCase(deleteOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearAdminOrderError,
  clearOrderDetail,
  calculateSummary,
} = adminOrderSlice.actions;

export default adminOrderSlice.reducer;
