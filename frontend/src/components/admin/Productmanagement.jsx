import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminProducts,
  deleteProduct,
} from "../../redux/slices/adminProductSlice";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Productmanagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products, loading, error } = useSelector(
    (state) => state.adminProduct
  );

  const [pendingDeleteProduct, setPendingDeleteProduct] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  const handleEdit = (product) => {
    navigate(`/admin/products/${product._id}/edit`);
  };

  const handleDelete = async (productId) => {
    try {
      await dispatch(deleteProduct(productId)).unwrap();
      alert("Product deleted successfully");
      setPendingDeleteProduct(null);
    } catch (err) {
      alert("Failed to delete product: " + err);
    }
  };

  const handleCancel = () => {
    setPendingDeleteProduct(null);
  };

  return (
    <div className="relative max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <button
          onClick={() => navigate("/admin/products/add")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add New Product
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {pendingDeleteProduct && (
        <div className="fixed bottom-6 right-6 bg-white shadow-lg border border-red rounded-lg p-4 z-50 max-w-sm w-full">
          <p className="text-red font-medium mb-3">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{pendingDeleteProduct.name}</span>?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => handleDelete(pendingDeleteProduct._id)}
              className="px-3 py-1 bg-red text-white rounded hover:bg-red"
            >
              Yes, Delete
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 border border-gray-300 text-gray-600 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red font-semibold mb-4">{error}</p>}

      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td className="py-3 px-4">
                    <Skeleton width={150} />
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton width={80} />
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton width={100} />
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton width={90} />
                  </td>
                  <td className="py-3 px-4 flex space-x-2">
                    <Skeleton width={60} height={28} />
                    <Skeleton width={60} height={28} />
                  </td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="py-4 px-4 text-center text-gray-400 italic"
                >
                  No products available.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id}>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {product.name}
                  </td>
                  <td className="py-3 px-4">
                    ${product.price?.toFixed(2) || "0.00"}
                  </td>
                  <td className="py-3 px-4">{product.sku || "-"}</td>
                  <td className="py-3 px-4">
                    {product.stock > 0 ? (
                      <span className="text-green-600 font-medium">
                        {product.stock}
                      </span>
                    ) : (
                      <span className="text-red font-medium">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 space-x-2">
                    <button
                      className="px-3 py-1 text-white bg-blue-500 hover:bg-blue-600 rounded"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 text-white bg-red hover:bg-red rounded"
                      onClick={() => setPendingDeleteProduct(product)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Productmanagement;
