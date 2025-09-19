import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setFilters } from "../../redux/slices/productSlice";

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

 useEffect(() => {
  let isMounted = true;

  const fetchFilters = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/products/filters`);
      if (!isMounted) return;

      // Agar koi array empty ya undefined ho to fallback
      const categories = data.categories?.length ? data.categories : ["Shirts","Pants","Shoes"];
      const sizes = data.sizes?.length ? data.sizes : ["S","M","L","XL"];
      const materials = data.materials?.length ? data.materials : ["Cotton","Leather"];
      const brands = data.brands?.length ? data.brands : ["BrandA","BrandB"];
      const genders = data.genders?.length ? data.genders : ["Male","Female"];

      setFilterOptions({ categories, sizes, materials, brands, genders });
      setLoadingFilters(false);
    } catch (err) {
      console.warn("Failed to fetch filters, using fallback.", err.message);
      if (isMounted) {
        setFilterOptions({
          categories: ["Shirts","Pants","Shoes"],
          sizes: ["S","M","L","XL"],
          materials: ["Cotton","Leather"],
          brands: ["BrandA","BrandB"],
          genders: ["Male","Female"],
        });
        setLoadingFilters(false);
      }
    }
  };

  // Agar pehle empty array mili ya undefined, dobara fetch
  if (
    !filterOptions.categories.length &&
    !filterOptions.sizes.length &&
    !filterOptions.materials.length &&
    !filterOptions.brands.length &&
    !filterOptions.genders.length
  ) {
    fetchFilters();
  }

  return () => { isMounted = false };
}, [API_BASE_URL, filterOptions]);


  // 🔹 Parse URL params
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
  }, [searchParams]);

  // 🔹 Handle filter change
  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    const updated = { ...filters };

    if (type === "checkbox") {
      if (checked) updated[name] = [...(updated[name] || []), value];
      else updated[name] = updated[name].filter((v) => v !== value);
    } else if (type === "radio" || type === "number" || type === "range") {
      updated[name] = type === "number" || type === "range" ? Number(value) : value;
    } else {
      updated[name] = value;
    }

    setFiltersState(updated);
    updateURLParams(updated);
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
  };

  if (loadingFilters) return <p className="p-4 text-gray-500">Loading filters...</p>;

  return (
    <div className="p-4">
      <h3 className="text-xl font-medium text-gray-800 mb-4">Filter</h3>
      <div className="mb-6">
        <button onClick={resetFilters} className="text-sm text-red-600 hover:text-red-800 border border-red-500 px-4 py-2 rounded-md">
          Reset Filters
        </button>
      </div>

      {/* Category */}
      {filterOptions.categories.length > 0 && (
        <div className="mb-6">
          <label className="block text-gray-600 font-medium mb-2">Category</label>
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
          <label className="block text-gray-600 font-medium mb-2">Material</label>
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

      {/* Price */}
      <div className="mb-8">
        <label className="block text-gray-600 font-medium mb-2">Price Range</label>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            name="minPrice"
            min={0}
            max={filters.maxPrice}
            value={filters.minPrice}
            onChange={handleFilterChange}
            className="w-1/2 p-1 border rounded"
          />
          <input
            type="number"
            name="maxPrice"
            min={filters.minPrice}
            max={200}
            value={filters.maxPrice}
            onChange={handleFilterChange}
            className="w-1/2 p-1 border rounded"
          />
        </div>
        <input
          type="range"
          name="maxPrice"
          min={0}
          max={200}
          value={filters.maxPrice}
          onChange={handleFilterChange}
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
