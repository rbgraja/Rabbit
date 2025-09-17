// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { fetchCart } from "./cartSlice";

const BASE_URL = import.meta.env.VITE_BACKGROUND_URL;

// 🛠 Load data from localStorage
const getUserFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo")) || null;
  } catch {
    return null;
  }
};
const getTokenFromStorage = () => localStorage.getItem("userToken") || null;

// 🆔 Generate guest ID if not exists
const initialGuestId = localStorage.getItem("guestId") || `guest_${Date.now()}`;
localStorage.setItem("guestId", initialGuestId);

// 🎯 Initial state
const initialState = {
  user: getUserFromStorage(),
  token: getTokenFromStorage(),
  guestId: initialGuestId,
  loading: false,
  error: null,
};

// 📥 Login User
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/users/login`, userData);

      const { token, user } = res.data;

      // ✅ Save to localStorage
      localStorage.setItem("userToken", token);
      localStorage.setItem("userInfo", JSON.stringify(user));

      // ✅ Fetch cart after login
      dispatch(fetchCart());

      return { user, token };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Login failed" });
    }
  }
);

// 📝 Register User
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/users/register`, userData);
      const { token, user } = res.data;

      // ✅ Save to localStorage
      localStorage.setItem("userToken", token);
      localStorage.setItem("userInfo", JSON.stringify(user));

      return { user, token };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Registration failed" });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.guestId = `guest_${Date.now()}`;
      localStorage.removeItem("userToken");
      localStorage.removeItem("userInfo");
      localStorage.setItem("guestId", state.guestId);
    },
    syncAuthFromStorage(state) {
      state.user = getUserFromStorage();
      state.token = getTokenFromStorage();
    },
    generateNewGuestId(state) {
      state.guestId = `guest_${Date.now()}`;
      localStorage.setItem("guestId", state.guestId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Registration failed";
      });
  },
});

export const { logout, syncAuthFromStorage, generateNewGuestId } = authSlice.actions;
export default authSlice.reducer;
