import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKGROUND_URL;

// ------------------ Thunks ------------------

// Fetch all testimonials (admin)
export const fetchAdminTestimonials = createAsyncThunk(
  "adminTestimonials/fetchAll",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token =
        getState().user?.user?.token || localStorage.getItem("userToken");
      if (!token) throw new Error("Not authenticated");

      // ✅ no approved query param → all testimonials
      const res = await axios.get(`${BASE_URL}/api/admin/testimonials`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data.testimonials;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update testimonial
export const updateAdminTestimonial = createAsyncThunk(
  "adminTestimonials/update",
  async ({ id, updates }, { rejectWithValue, getState }) => {
    try {
      const token =
        getState().user?.user?.token || localStorage.getItem("userToken");
      if (!token) throw new Error("Not authenticated");

      const res = await axios.put(
        `${BASE_URL}/api/admin/testimonials/${id}`,
        updates,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return res.data.testimonial;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete testimonial
export const deleteAdminTestimonial = createAsyncThunk(
  "adminTestimonials/delete",
  async (id, { rejectWithValue, getState }) => {
    try {
      const token =
        getState().user?.user?.token || localStorage.getItem("userToken");
      if (!token) throw new Error("Not authenticated");

      await axios.delete(`${BASE_URL}/api/admin/testimonials/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ------------------ Slice ------------------
const adminTestimonialSlice = createSlice({
  name: "adminTestimonials",
  initialState: {
    testimonials: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminTestimonialError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAdminTestimonials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminTestimonials.fulfilled, (state, action) => {
        state.loading = false;
        state.testimonials = action.payload;
      })
      .addCase(fetchAdminTestimonials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateAdminTestimonial.fulfilled, (state, action) => {
        const idx = state.testimonials.findIndex(
          (t) => t._id === action.payload._id
        );
        if (idx !== -1) state.testimonials[idx] = action.payload;
      })

      // Delete
      .addCase(deleteAdminTestimonial.fulfilled, (state, action) => {
        state.testimonials = state.testimonials.filter(
          (t) => t._id !== action.payload
        );
      });
  },
});

export const { clearAdminTestimonialError } = adminTestimonialSlice.actions;
export default adminTestimonialSlice.reducer;
