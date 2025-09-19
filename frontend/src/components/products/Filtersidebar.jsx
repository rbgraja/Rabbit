import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setFilters } from "../../redux/slices/productSlice";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Filtersidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    sizes: [],
    materials: [],
    brands: [],
    genders: [],
  });

  const [loadingFilters, setLoadingFilters] = useState(true);

  const defaultFilters = {
    category: "",
    gender: "",
    size: [],
    material: [],
    brand: [],
    minPrice: 0,
    maxPrice: 200,
    sortBy: "",
  };

  const [filters, setFiltersState] = useState(defaultFilters);

  const API_BASE_URL = import.meta.env.VITE_BACKGROUND_URL || "";

  // 🔹 Fetch filters dynamically based on current selection
  const fetchFilters = async (activeFilters) => {
    try {
      setLoadingFilters(true);

      const query = new URLSearchParams();
      if (activeFilters.category) query.set("category", activeFilters.category);
      if (activeFilters.gender) query.set("gender", activeFilters.gender);
      if (activeFilters.size.length > 0) query.set("size", activeFilters.size.join(","));
      if (activeFilters.material.length > 0) query.set("material", activeFilters.material.join(","));
      if (activeFilters.brand.length > 0) query.set("brand", activeFilters.brand.join(","));
      if (activeFilters.minPrice > 0) query.set("minPrice", activeFilters.minPrice);
      if (activeFilters.maxPrice < 200) query.set("maxPrice", activeFilters.maxPrice);

      const { data } = await axios.get(
        `${API_BASE_URL}/api/products/filters?${query.toString()}`
      );

      setFilterOptions({
        categories: data.categories || [],
        sizes: data.sizes || [],
        materials: data.materials || [],
        brands: data.brands || [],
        genders: data.genders || [],
      });
    } catch (err) {
      console.warn("Failed to fetch filters:", err.message);
    } finally {
      setLoadingFilters(false);
    }
  };

  // 🔹 On mount → set filters from URL & fetch options
  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);
    const parsed = {
      category: params.category || "",
      gender: params.gender || "",
      size: params.size ? params.size.split(",") : [],
      material: params.material ? params.material.split(",") : [],
      brand: params.brand ? params.brand.split(",") : [],
      minPrice: Number(params.minPrice) || 0,
      maxPrice: Number(params.maxPrice) || 200,
      sortBy: params.sortBy || "",
    };
    setFiltersState(parsed);
    dispatch(setFilters(parsed));
    fetchFilters(parsed);
  }, [searchParams]);

  // 🔹 Handle filter change
  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    const updated = { ...filters };

    if (type === "checkbox") {
      if (checked) updated[name] = [...(updated[name] || []), value];
      else updated[name] = updated[name].filter((v) => v !== value);
    } else if (type === "radio" || type === "number" || type === "range") {
      updated[name] =
        type === "number" || type === "range" ? Number(value) : value;
    } else {
      updated[name] = value;
    }

    setFiltersState(updated);
    updateURLParams(updated);
    fetchFilters(updated); // 🔥 refresh filter options dynamically
  };

  // 🔹 Update URL params
  const updateURLParams = (newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (Array.isArray(val) && val.length > 0) params.set(key, val.join(","));
      else if (val !== "" && val !== 0) params.set(key, val);
    });
    setSearchParams(params);
    navigate(`?${params.toString()}`);
    dispatch(setFilters(newFilters));
  };

  // 🔹 Reset filters
  const resetFilters = () => {
    setFiltersState(defaultFilters);
    setSearchParams({});
    navigate("?");
    dispatch(setFilters(defaultFilters));
    fetchFilters(defaultFilters);
  };

  if (loadingFilters) {
    return (
      <div className="p-4 space-y-6">
        <Skeleton height={30} width={120} />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton height={20} width={100} />
            <Skeleton count={3} height={15} width={80} />
          </div>
        ))}
        <Skeleton height={40} width={150} />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-xl font-medium text-gray-800 mb-4">Filter</h3>
      <div className="mb-6">
        <button
          onClick={resetFilters}
          className="text-sm text-red-600 hover:text-red-800 border border-red-500 px-4 py-2 rounded-md"
        >
          Reset Filters
        </button>
      </div>

      {/* Category */}
      {filterOptions.categories.length > 0 && (
        <div className="mb-6">
          <label className="block text-gray-600 font-medium mb-2">
            Category
          </label>
          {filterOptions.categories.map((c) => (
            <div key={c} className="flex items-center mb-1">
              <input
                name="category"
                type="radio"
                value={c}
                checked={filters.category === c}
                onChange={handleFilterChange}
                className="mr-2"
              />
              <span>{c}</span>
            </div>
          ))}
        </div>
      )}

      {/* Gender */}
      {filterOptions.genders.length > 0 && (
        <div className="mb-6">
          <label className="block text-gray-600 font-medium mb-2">Gender</label>
          {filterOptions.genders.map((g) => (
            <div key={g} className="flex items-center mb-1">
              <input
                name="gender"
                type="radio"
                value={g}
                checked={filters.gender === g}
                onChange={handleFilterChange}
                className="mr-2"
              />
              <span>{g}</span>
            </div>
          ))}
        </div>
      )}

      {/* Size */}
      {filterOptions.sizes.length > 0 && (
        <div className="mb-6">
          <label className="block text-gray-600 font-medium mb-2">Size</label>
          {filterOptions.sizes.map((s) => (
            <div key={s} className="flex items-center mb-1">
              <input
                name="size"
                type="checkbox"
                value={s}
                checked={filters.size.includes(s)}
                onChange={handleFilterChange}
                className="mr-2"
              />
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* Material */}
      {filterOptions.materials.length > 0 && (
        <div className="mb-6">
          <label className="block text-gray-600 font-medium mb-2">
            Material
          </label>
          {filterOptions.materials.map((m) => (
            <div key={m} className="flex items-center mb-1">
              <input
                name="material"
                type="checkbox"
                value={m}
                checked={filters.material.includes(m)}
                onChange={handleFilterChange}
                className="mr-2"
              />
              <span>{m}</span>
            </div>
          ))}
        </div>
      )}

      {/* Brand */}
      {filterOptions.brands.length > 0 && (
        <div className="mb-6">
          <label className="block text-gray-600 font-medium mb-2">Brand</label>
          {filterOptions.brands.map((b) => (
            <div key={b} className="flex items-center mb-1">
              <input
                name="brand"
                type="checkbox"
                value={b}
                checked={filters.brand.includes(b)}
                onChange={handleFilterChange}
                className="mr-2"
              />
              <span>{b}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Filtersidebar;
