// src/redux/slices/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKGROUND_URL || "http://localhost:9000";
console.log("🔍 BASE_URL loaded:", BASE_URL);

/* ------------------------- Helper Functions ------------------------- */
const convertSortKey = (key) => {
  switch (key) {
    case "priceAsc":
      return "price_asc";
    case "priceDesc":
      return "price_desc";
    case "popularity":
      return "popular";
    default:
      return "latest";
  }
};

const applyDiscount = (product) => {
  const discount = product.discount || 0;
  const price = product.price || 0;
  return discount > 0 ? Math.round(price - (price * discount) / 100) : price;
};

// ✅ Token helper
const getToken = (getState, passedToken) => {
  return passedToken || getState()?.auth?.user?.token || localStorage.getItem("userToken");
};

/* ----------------------- Async Thunks ----------------------- */

// Fetch products by filters
export const fetchProductFilters = createAsyncThunk(
  "products/fetchByFilters",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query.append(key, value);
      });
      const response = await axios.get(`${BASE_URL}/api/products?${query.toString()}`);
      return response.data.products || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
    }
  }
);

// Fetch single product detail
export const fetchProductDetail = createAsyncThunk(
  "products/fetchProductDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/products/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch product detail");
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData, token }, { getState, rejectWithValue }) => {
    try {
      const authToken = getToken(getState, token);
      if (!authToken) throw new Error("No token found");

      const response = await axios.put(`${BASE_URL}/api/products/${id}`, productData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to update product");
    }
  }
);

// Fetch similar products
export const similarProducts = createAsyncThunk(
  "products/fetchSimilarProducts",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/products/similar/${id}`);
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch similar products");
    }
  }
);

// Add to cart
export const addToCart = createAsyncThunk(
  "products/addToCart",
  async (cartItem, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);
      if (!token) throw new Error("No token found");

      const response = await axios.post(`${BASE_URL}/api/cart`, cartItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to add to cart");
    }
  }
);

// Helper: get token


// 📝 Add review
export const addReview = createAsyncThunk(
  "products/addReview",
  async ({ productId, reviewData, token }, { rejectWithValue }) => {
    const getToken = (token) => token || localStorage.getItem("userToken");
    try {
      const authToken = getToken(token);
      if (!authToken) throw new Error("No token found");

      const response = await axios.post(
        `${BASE_URL}/api/products/${productId}/reviews`,
        reviewData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      return response.data; // backend returns updated product
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to add review"
      );
    }
  }
);


/* ----------------------- Product Slice ----------------------- */
const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    selectedProduct: null,
    similarProducts: [],
    listLoading: false,
    detailLoading: false,
    updateLoading: false,
    cartLoading: false,
    reviewLoading: false,
    error: null,
    filters: {
      category: "",
      size: "",
      color: "",
      gender: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "",
      keyword: "",
      material: "",
      collection: "",
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      Object.keys(state.filters).forEach((k) => (state.filters[k] = ""));
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch filtered products
      .addCase(fetchProductFilters.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchProductFilters.fulfilled, (state, action) => {
        state.listLoading = false;
        state.products = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchProductFilters.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload || action.error.message;
      })

      // Product detail
      .addCase(fetchProductDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        const product = action.payload;
        product.discountedPrice = applyDiscount(product);
        product.colors = Array.isArray(product.colors)
          ? product.colors
          : product.color
          ? [product.color]
          : [];
        product.sizes = Array.isArray(product.sizes)
          ? product.sizes
          : product.size
          ? [product.size]
          : [];
        state.selectedProduct = product;
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || action.error.message;
      })

      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedProduct = action.payload;
        const index = state.products.findIndex((p) => p._id === updatedProduct._id);
        if (index !== -1) state.products[index] = updatedProduct;
        if (state.selectedProduct?._id === updatedProduct._id) state.selectedProduct = updatedProduct;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload || action.error.message;
      })

      // Similar products
      .addCase(similarProducts.pending, (state) => { state.error = null; })
      .addCase(similarProducts.fulfilled, (state, action) => {
        state.similarProducts = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(similarProducts.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      // Add to cart
      .addCase(addToCart.pending, (state) => { state.cartLoading = true; state.error = null; })
      .addCase(addToCart.fulfilled, (state) => { state.cartLoading = false; })
      .addCase(addToCart.rejected, (state, action) => {
        state.cartLoading = false;
        state.error = action.payload || action.error.message;
      })

      // Add review
      .addCase(addReview.pending, (state) => { state.reviewLoading = true; state.error = null; })
      .addCase(addReview.fulfilled, (state, action) => {
        state.reviewLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.reviewLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

/* ----------------------- Exports ----------------------- */
export const { setFilters, clearFilters } = productSlice.actions;
export default productSlice.reducer;
