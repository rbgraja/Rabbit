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

function Home() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const [bestSellerProduct, setBestSellerProduct] = useState(null);

  useEffect(() => {
    // ✅ Reset global filters first (important!)
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
      {bestSellerProduct ? (
        <Productdetail productId={bestSellerProduct._id} />
      ) : (
        <p className="text-center text-gray-500">Loading best seller...</p>
      )}

      {/* 👗 Women's Topwear */}
      <h2 className="text-3xl text-center font-bold mt-12 mb-4">
        Top Wears for Women
      </h2>
      {loading ? (
        <p className="text-center text-gray-500">Loading products...</p>
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
