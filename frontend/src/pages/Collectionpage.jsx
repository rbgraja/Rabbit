import React, { useEffect, useRef, useState } from 'react';
import { FaFilter } from "react-icons/fa";
import Filtersidebar from '../components/products/Filtersidebar';
import Sortoption from '../components/products/Sortoption';
import Productsgrid from '../components/products/Productsgrid';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductFilters, setFilters, clearFilters } from '../redux/slices/productSlice';
import { useSearchParams } from 'react-router-dom';

// ✅ Local Skeleton (no extra file needed)
function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
  );
}

function Collectionpage() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);
  const [issidebaropen, setissidebaropen] = useState(false);

  const { products, loading, error } = useSelector((state) => state.products);

  const togglesidebar = () => setissidebaropen(!issidebaropen);

  const handleclickoutside = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setissidebaropen(false);
    }
  };

  // ✅ Parse filters from URL
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

    dispatch(clearFilters());
    dispatch(setFilters(params));
    dispatch(fetchProductFilters(params));
  }, [searchParams, dispatch]);

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
          // ✅ Skeleton Loader
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="space-y-3">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
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
