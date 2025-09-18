import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { fetchProductFilters, setFilters } from "../../redux/slices/productSlice";

function Filtersidebar() {
  const [searchparams, setsearchparams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    sizes: [],
    materials: [],
    brands: [],
    genders: [],
  });

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

  const [filters, setfilters] = useState(defaultFilters);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "";

  // 🔹 Backend se filter options fetch
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/products/filters`);
        setFilterOptions({
          categories: data.categories || [],
          sizes: data.sizes || [],
          materials: data.materials || [],
          brands: data.brands || [],
          genders: data.genders || [],
        });
      } catch (err) {
        console.error("❌ Error fetching filter options:", err.message);
      }
    };
    fetchOptions();
  }, [API_BASE_URL]);

  // 🔹 URL se filters parse karna
  useEffect(() => {
    const params = Object.fromEntries([...searchparams]);
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
    setfilters(parsed);
    dispatch(setFilters(parsed));
  }, [searchparams]);

  const handlefilterchange = (e) => {
    const { name, value, checked, type } = e.target;
    const updated = { ...filters };

    if (type === "checkbox") {
      if (checked) {
        updated[name] = [...(updated[name] || []), value];
      } else {
        updated[name] = updated[name].filter((v) => v !== value);
      }
    } else if (type === "radio" || type === "button" || type === "number" || type === "range") {
      updated[name] = value;
    } else {
      updated[name] = value;
    }

    setfilters(updated);
    updateURLparams(updated);
  };

  const updateURLparams = (newfilters) => {
    const params = new URLSearchParams();
    Object.entries(newfilters).forEach(([key, val]) => {
      if (Array.isArray(val) && val.length > 0) {
        params.set(key, val.join(","));
      } else if (val !== "" && val !== 0) {
        params.set(key, val);
      }
    });

    setsearchparams(params);
    navigate(`?${params.toString()}`);
    dispatch(setFilters(newfilters));
  };

  const resetFilters = () => {
    setfilters(defaultFilters);
    setsearchparams({});
    navigate("?");
    dispatch(setFilters(defaultFilters));
    dispatch(fetchProductFilters(defaultFilters));
  };

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
          <label className="block text-gray-600 font-medium mb-2">Category</label>
          {filterOptions.categories.map((category) => (
            <div key={category} className="flex items-center mb-1">
              <input
                name="category"
                type="radio"
                value={category}
                checked={filters.category === category}
                onChange={handlefilterchange}
                className="mr-2"
              />
              <span>{category}</span>
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
                onChange={handlefilterchange}
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
          {filterOptions.sizes.map((size) => (
            <div key={size} className="flex items-center mb-1">
              <input
                name="size"
                type="checkbox"
                value={size}
                checked={filters.size.includes(size)}
                onChange={handlefilterchange}
                className="mr-2"
              />
              <span>{size}</span>
            </div>
          ))}
        </div>
      )}

      {/* Material */}
      {filterOptions.materials.length > 0 && (
        <div className="mb-6">
          <label className="block text-gray-600 font-medium mb-2">Material</label>
          {filterOptions.materials.map((mat) => (
            <div key={mat} className="flex items-center mb-1">
              <input
                name="material"
                type="checkbox"
                value={mat}
                checked={filters.material.includes(mat)}
                onChange={handlefilterchange}
                className="mr-2"
              />
              <span>{mat}</span>
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
                onChange={handlefilterchange}
                className="mr-2"
              />
              <span>{b}</span>
            </div>
          ))}
        </div>
      )}

      {/* Price Range */}
      <div className="mb-8">
        <label className="block text-gray-600 font-medium mb-2">Price Range</label>
        <div className="flex justify-between items-center mb-2 gap-2">
          <input
            type="number"
            name="minPrice"
            min={0}
            max={filters.maxPrice}
            value={filters.minPrice}
            onChange={handlefilterchange}
            className="w-1/2 p-1 border rounded"
          />
          <input
            type="number"
            name="maxPrice"
            min={filters.minPrice}
            max={200}
            value={filters.maxPrice}
            onChange={handlefilterchange}
            className="w-1/2 p-1 border rounded"
          />
        </div>

        <input
          type="range"
          name="maxPrice"
          min={0}
          max={200}
          value={filters.maxPrice}
          onChange={handlefilterchange}
          className="w-full"
        />
        <div className="flex justify-between text-gray-600 mt-2">
          <span>${filters.minPrice}</span>
          <span>${filters.maxPrice}</span>
        </div>
      </div>
    </div>
  );
}

export default Filtersidebar;
