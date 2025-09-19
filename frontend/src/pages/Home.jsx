import React, { useEffect, useState } from 'react';
import Hero from '../components/layout/Hero';
import Gendercollectionsection from '../components/products/Gendercollectionsection';
import NewArrival from '../components/products/NewArrival';
import Productdetail from '../components/products/Productdetail';
import Productsgrid from '../components/products/Productsgrid';
import FeaturesCollection from '../components/products/FeaturesCollection';
import FeaturesSection from '../components/products/FeaturesSection';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductFilters, clearFilters } from '../redux/slices/productSlice';
import axios from 'axios';

// ✅ Local Skeleton (reusable, no extra file needed)
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />;
}

function Home() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const [bestSellerProduct, setBestSellerProduct] = useState(null);
  const [bestSellerLoading, setBestSellerLoading] = useState(true);

  useEffect(() => {
    // ✅ Reset global filters
    dispatch(clearFilters());

    // ✅ Fetch filtered products only for 'Women' top wears
    dispatch(fetchProductFilters({ gender: 'Women' }));

    // ✅ Fetch best seller product
    const fetchBestSeller = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKGROUND_URL}/api/products/best-sellers`
        );
        if (Array.isArray(data) && data.length > 0) {
          setBestSellerProduct(data[0]);
        }
      } catch (err) {
        console.error('Best Seller Error:', err);
      } finally {
        setBestSellerLoading(false);
      }
    };

    fetchBestSeller();
  }, [dispatch]);

  return (
    <div>
      <Hero />
      <Gendercollectionsection />
      <NewArrival />

      {/* ⭐ Best Seller Section */}
      <h2 className="text-3xl text-center font-bold mb-4">Best Seller</h2>
      {bestSellerLoading ? (
        // ✅ Skeleton for Best Seller
        <div className="flex justify-center">
          <div className="space-y-3 w-72">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ) : bestSellerProduct ? (
        <Productdetail productId={bestSellerProduct._id} />
      ) : (
        <p className="text-center text-gray-500">No best seller found</p>
      )}

      {/* 👗 Women's Topwear */}
      <h2 className="text-3xl text-center font-bold mt-12 mb-4">
        Top Wears for Women
      </h2>
      {loading ? (
        // ✅ Skeleton Grid for Women’s Topwear
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

      <FeaturesCollection />
      <FeaturesSection />
    </div>
  );
}

export default Home;
