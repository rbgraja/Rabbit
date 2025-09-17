import React from 'react';
import { Link } from 'react-router-dom';

function Productsgrid({ products, loading = false, error = null }) {
  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  // 🛡️ Safely default to empty array if products is null or undefined
  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {safeProducts.map((product) => (
        <Link key={product._id} to={`/product/${product._id}`}>
          <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition">
            <div className="w-full h-96 mb-4">
              <img
                src={product?.images?.[0]?.url || '/fallback.jpg'}
                alt={product?.images?.[0]?.alt || product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <h3 className="text-sm mb-2">{product.name}</h3>
            <p className="text-gray-500 font-medium text-sm">${product.price}</p>
            {/* ✅ Show stock */}
            <p className="text-green-600 font-medium text-sm mt-1">
              Stock: {product.stock ?? 0} available
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default Productsgrid;
