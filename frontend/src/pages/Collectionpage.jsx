import React, { useEffect, useRef, useState } from 'react';
import { FaFilter } from "react-icons/fa";
import Filtersidebar from '../components/products/Filtersidebar';
import Sortoption from '../components/products/Sortoption';
import Productsgrid from '../components/products/Productsgrid';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductFilters, setFilters, clearFilters } from '../redux/slices/productSlice';
import { useSearchParams } from 'react-router-dom';

function Collectionpage() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);
  const [issidebaropen, setissidebaropen] = useState(false);

  const { products, filters, loading, error } = useSelector((state) => state.products);

  const togglesidebar = () => setissidebaropen(!issidebaropen);

  const handleclickoutside = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setissidebaropen(false);
    }
  };

  // ✅ Step 1: Parse and apply filters directly from URL
  useEffect(() => {
    const params = {};
    const keys = [
      'keyword',
      'gender',
      'category',
      'collection',
      'brand',
      'color',
      'size',
      'material',
      'minPrice',
      'maxPrice',
      'sortBy'
    ];

    keys.forEach(key => {
      const value = searchParams.get(key);
      if (value !== null && value !== "undefined" && value !== "") {
        params[key] = value;
      }
    });

    // Reset + set + fetch manually to avoid double dispatch
    dispatch(clearFilters());
    dispatch(setFilters(params));
    dispatch(fetchProductFilters(params)); // ✅ use params directly
  }, [searchParams, dispatch]);

  // ✅ Step 2: Remove filters dependency fetch (prevent double render)
  // ❌ DON'T use `useEffect(() => dispatch(fetchProductFilters(filters)), [filters])`

  // ✅ Sidebar click outside
  useEffect(() => {
    document.addEventListener("mousedown", handleclickoutside);
    return () => {
      document.removeEventListener("mousedown", handleclickoutside);
    };
  }, []);

  return (
    <div className='flex flex-col lg:flex-row'>
      {/* Mobile filter toggle */}
      <button
        onClick={togglesidebar}
        className='lg:hidden border p-2 flex justify-center items-center'
      >
        <FaFilter className='mr-2' />
        Filter
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`${issidebaropen ? "translate-x-0" : "-translate-x-full"} 
        fixed inset-y-0 z-50 left-0 w-64 bg-white overflow-y-auto 
        transition-transform duration-300 lg:static lg:translate-x-0 lg:flex-shrink-0 lg:w-[13rem]`}
      >
        <Filtersidebar />
      </div>

      {/* Main Content */}
      <div className='flex-grow p-4'>
        <h2 className='text-2xl uppercase mb-4'>All Collection</h2>
        <Sortoption />
        {loading ? (
          <p className="text-center text-gray-500">Loading products...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <Productsgrid products={products} />
        )}
      </div>
    </div>
  );
}

export default Collectionpage;
