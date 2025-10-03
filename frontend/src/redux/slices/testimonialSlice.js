import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKGROUND_URL;

// 🔑 Helper to get token
const getToken = (getState) =>
  getState().user?.user?.token || localStorage.getItem("userToken");

// ------------------ Thunks ------------------

// ✅ Fetch all testimonials
export const fetchTestimonials = createAsyncThunk(
  "testimonials/fetchAll",
  async ({ page = 1, limit = 10, approved = true, product }, { rejectWithValue }) => {
    try {
      let query = `?page=${page}&limit=${limit}`;
      if (approved !== undefined) query += `&approved=${approved}`;
      if (product) query += `&product=${product}`;

      const res = await axios.get(`${BASE_URL}/api/testimonials${query}`);
      return res.data; // { success, data, page, pages, total }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Create testimonial (with image upload support)
export const createTestimonial = createAsyncThunk(
  "testimonials/create",
  async (testimonialData, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);
      if (!token) throw new Error("Not authenticated");

      const formData = new FormData();

      // Append normal fields
      for (const key in testimonialData) {
        if (key === "images") continue; // images separately
        const value = testimonialData[key];
        formData.append(
          key,
          Array.isArray(value) ? JSON.stringify(value) : value
        );
      }

      // Append image files
      if (testimonialData.images && testimonialData.images.length) {
        testimonialData.images.forEach((img) => {
          if (img.file) formData.append("images", img.file); // local file
          else if (img.url) formData.append("images", img.url); // already uploaded url
        });
      }

      const res = await axios.post(`${BASE_URL}/api/testimonials`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data.data; // testimonial object
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Update testimonial (append new images + update fields)
export const updateTestimonial = createAsyncThunk(
  "testimonials/update",
  async ({ id, updates }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);
      if (!token) throw new Error("Not authenticated");

      const formData = new FormData();

      // append normal fields
      for (const key in updates) {
        if (key === "images") continue;
        const value = updates[key];
        formData.append(
          key,
          Array.isArray(value) ? JSON.stringify(value) : value
        );
      }

      // append images if exist
      if (updates.images && updates.images.length) {
        updates.images.forEach((img) => {
          if (img.file) formData.append("images", img.file);
          else if (img.url) formData.append("images", img.url);
        });
      }

      const res = await axios.put(`${BASE_URL}/api/testimonials/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data.data; // updated testimonial
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ Delete testimonial (admin only → soft delete)
export const deleteTestimonial = createAsyncThunk(
  "testimonials/delete",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);
      if (!token) throw new Error("Not authenticated");

      const res = await axios.delete(`${BASE_URL}/api/testimonials/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data; // deleted testimonial
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ------------------ Slice ------------------
const testimonialSlice = createSlice({
  name: "testimonial",
  initialState: {
    testimonials: [],
    page: 1,
    pages: 1,
    total: 0,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearTestimonialState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchTestimonials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestimonials.fulfilled, (state, action) => {
        state.loading = false;
        state.testimonials = action.payload?.data || [];
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(fetchTestimonials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // create
      .addCase(createTestimonial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTestimonial.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (action.payload) {
          state.testimonials.unshift(action.payload);
        }
      })
      .addCase(createTestimonial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // update
      .addCase(updateTestimonial.fulfilled, (state, action) => {
        state.success = true;
        if (action.payload) {
          state.testimonials = state.testimonials.map((t) =>
            t._id === action.payload._id ? action.payload : t
          );
        }
      })
      .addCase(updateTestimonial.rejected, (state, action) => {
        state.error = action.payload;
      })

      // delete
      .addCase(deleteTestimonial.fulfilled, (state, action) => {
        state.success = true;
        if (action.payload) {
          state.testimonials = state.testimonials.filter(
            (t) => t._id !== action.payload._id
          );
        }
      })
      .addCase(deleteTestimonial.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearTestimonialState } = testimonialSlice.actions;
export default testimonialSlice.reducer;
