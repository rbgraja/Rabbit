import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKGROUND_URL;

// 🔁 Helper to map sort keys
const convertSortKey = (key) => {
  switch (key) {
    case "priceAsc": return "price_asc";
    case "priceDesc": return "price_desc";
    case "popularity": return "popular";
    default: return "latest";
  }
};

// 🔍 Fetch filtered products
const fetchProductFilters = createAsyncThunk(
  "products/fetchByFilters",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();

      if (filters.collection) query.append("collection", filters.collection);
      if (filters.size) query.append("sizes", filters.size);
      if (filters.color) query.append("color", filters.color);
      if (filters.gender) query.append("gender", filters.gender);
  if (filters.minPrice && !isNaN(filters.minPrice)) {
  query.append("minPrice", filters.minPrice);
}
if (filters.maxPrice && !isNaN(filters.maxPrice)) {
  query.append("maxPrice", filters.maxPrice);
}
      if (filters.sortBy) query.append("sort", convertSortKey(filters.sortBy));
      if (filters.keyword) query.append("keyword", filters.keyword); // match backend
      if (filters.category) query.append("category", filters.category);
      if (filters.material) query.append("material", filters.material);
      if (filters.brand) query.append("brand", filters.brand);
      if (filters.limit) query.append("limit", filters.limit);

      const response = await axios.get(`${BASE_URL}/api/products?${query.toString()}`);
      return response.data.products || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
    }
  }
);

/* ------------------------ 📦 Fetch Single Product ------------------------ */
const fetchProductDetail = createAsyncThunk(
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

/* ---------------------------- ✏️ Update Product --------------------------- */
const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/products/${id}`, productData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update product");
    }
  }
);

/* ------------------------ 📍 Fetch Similar Products ------------------------ */
const similarProducts = createAsyncThunk(
  "products/fetchSimilarProducts",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/products/similar/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch similar products");
    }
  }
);

/* ----------------------------- 🛒 Add to Cart ----------------------------- */
const addToCart = createAsyncThunk(
  "products/addToCart",
  async (cartItem, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/cart`, cartItem, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add to cart");
    }
  }
);

/* ----------------------------- 🧠 Product Slice ----------------------------- */
const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    selectedProduct: null,
    similarProducts: null,
    loading: false,
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
      search: "",
      material: "",
      collection: "",
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: "",
        size: "",
        color: "",
        gender: "",
        brand: "",
        minPrice: "",
        maxPrice: "",
        sortBy: "",
        search: "",
        material: "",
        collection: "",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔍 Fetch by filters
      .addCase(fetchProductFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.products = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchProductFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // 📦 Product Detail
      .addCase(fetchProductDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.loading = false;
        const product = action.payload;

        // Normalize fallback (in case old data still has `color` or `size`)
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
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // ✏️ Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload;
        const index = state.products.findIndex((p) => p._id === updatedProduct._id);
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // 📍 Similar Products
      .addCase(similarProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(similarProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.similarProducts = action.payload;
      })
      .addCase(similarProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // 🛒 Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

/* ------------------------------ ✅ Exports ------------------------------ */
export const { setFilters, clearFilters } = productSlice.actions;
export default productSlice.reducer;

// ✅ Export async thunks
export {
  fetchProductFilters,
  fetchProductDetail,
  updateProduct,
  similarProducts,
  addToCart,
};
