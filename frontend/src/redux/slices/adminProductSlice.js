import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKGROUND_URL;

// Helper to get token
const getToken = (getState) =>
  getState().user?.user?.token || localStorage.getItem("userToken");

// ------------------ Thunks ------------------

// Fetch all products
export const fetchAdminProducts = createAsyncThunk(
  "adminProducts/fetchAll",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      if (!token) throw new Error("Not authenticated");
      const res = await axios.get(`${BASE_URL}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.products;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get product by ID
export const getAdminProductById = createAsyncThunk(
  "adminProducts/getById",
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      if (!token) throw new Error("Not authenticated");
      const res = await axios.get(`${BASE_URL}/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.product;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create product (updated like updateProduct)
export const createProduct = createAsyncThunk(
  "adminProducts/create",
  async (productData, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      if (!token) throw new Error("Not authenticated");

      const formData = new FormData();

      // Append normal fields
      for (const key in productData) {
        if (key === "images") continue; // files separately
        const value = productData[key];
        formData.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
      }

      // Append images files if exist
      if (productData.images && productData.images.length) {
        productData.images.forEach((img) => {
          if (img.file) formData.append("images", img.file); // file object
          else if (img.url) formData.append("images", img.url); // optional fallback
        });
      }

      const res = await axios.post(`${BASE_URL}/api/admin/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data.product;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);





// Update product
export const updateProduct = createAsyncThunk(
  "adminProducts/update",
  async ({ id, updates }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      if (!token) throw new Error("Not authenticated");

      const payload = {
        ...updates,
        images: updates.images?.map((img) => ({ url: img.url, alt: img.alt || "" })),
      };

      const res = await axios.put(`${BASE_URL}/api/admin/products/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.product;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  "adminProducts/delete",
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState);
      if (!token) throw new Error("Not authenticated");
      await axios.delete(`${BASE_URL}/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ------------------ Slice ------------------
const adminProductSlice = createSlice({
  name: "adminProducts",
  initialState: {
    products: [],
    productDetail: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminProductError(state) {
      state.error = null;
    },
    clearProductDetail(state) {
      state.productDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAdminProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => { state.loading = false; state.products = action.payload; })
      .addCase(fetchAdminProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Get by ID
      .addCase(getAdminProductById.pending, (state) => { state.loading = true; state.error = null; state.productDetail = null; })
      .addCase(getAdminProductById.fulfilled, (state, action) => { state.loading = false; state.productDetail = action.payload; })
      .addCase(getAdminProductById.rejected, (state, action) => { state.loading = false; state.error = action.payload; state.productDetail = null; })

      // Create
      .addCase(createProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createProduct.fulfilled, (state, action) => { state.loading = false; state.products.unshift(action.payload); })
      .addCase(createProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Update
      .addCase(updateProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.products.findIndex(p => p._id === action.payload._id);
        if (idx !== -1) state.products[idx] = action.payload;
        if (state.productDetail && state.productDetail._id === action.payload._id) state.productDetail = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Delete
      .addCase(deleteProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteProduct.fulfilled, (state, action) => { state.loading = false; state.products = state.products.filter(p => p._id !== action.payload); })
      .addCase(deleteProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearAdminProductError, clearProductDetail } = adminProductSlice.actions;
export default adminProductSlice.reducer;
