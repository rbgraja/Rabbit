import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getAdminProductById,
  updateProduct,
  createProduct,
  clearProductDetail,
} from "../../redux/slices/adminProductSlice";

function Handleedit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { productDetail, loading, error } = useSelector(
    (state) => state.adminProduct
  ) || { productDetail: null, loading: false, error: null };

  const fallbackProduct = {
    name: "",
    description: "",
    price: 0,
    stock: 0,
    sku: "",
    category: "",
    brand: "",
    sizes: [],
    colors: [],
    collection: "",
    material: "",
    gender: "Unisex",
    images: [],
    isFeatured: false,
    isActive: true,
    isPublished: false,
  };

  const [productData, setProductData] = useState(fallbackProduct);
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (id) dispatch(getAdminProductById(id));
    return () => dispatch(clearProductDetail());
  }, [id, dispatch]);

  useEffect(() => {
    if (productDetail && id) {
      setProductData({
        ...fallbackProduct,
        ...productDetail,
        sizes: Array.isArray(productDetail.sizes) ? productDetail.sizes : String(productDetail.sizes || "").split(",").map((v) => v.trim()),
        colors: Array.isArray(productDetail.colors) ? productDetail.colors : String(productDetail.color || "").split(",").map((v) => v.trim()),
        gender: ["Men", "Women", "Unisex"].includes(productDetail.gender) ? productDetail.gender : "Unisex",
        images: Array.isArray(productDetail.images) ? productDetail.images.map((img) => ({ url: img.url, alt: img.alt || "" })) : [],
      });
    }
  }, [productDetail, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "price" || name === "stock") {
      setProductData({ ...productData, [name]: Number(value) });
    } else if (name === "sizes" || name === "colors") {
      setProductData({ ...productData, [name]: value.split(",").map((v) => v.trim()) });
    } else {
      setProductData({ ...productData, [name]: value });
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setProductData((prev) => ({
        ...prev,
        images: [...prev.images, { url: newImageUrl, alt: "" }],
      }));
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index) => {
    setProductData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...productData,
      images: productData.images.map((img) => ({ url: img.url, alt: img.alt || "" })),
    };

    console.log("Submitting product payload:", payload);

    try {
      if (id) {
        await dispatch(updateProduct({ id, updates: payload })).unwrap();
        alert("✅ Product updated successfully!");
      } else {
        await dispatch(createProduct(payload)).unwrap();
        alert("✅ Product added successfully!");
      }
      navigate("/admin/products");
    } catch (err) {
      console.error("Create/Edit product failed:", err);
      alert("❌ Failed to save product: " + err);
    }
  };

  if (loading) return <p className="text-center">⏳ Loading product...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md bg-white">
      <h2 className="text-3xl font-bold mb-6">{id ? "Edit Product" : "Add New Product"}</h2>

      {error && <p className="text-red-600 mb-4 font-medium bg-red-100 p-3 rounded">⚠️ {error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "name", label: "Product Name" },
            { name: "sku", label: "SKU" },
            { name: "price", label: "Price", type: "number" },
            { name: "stock", label: "Stock", type: "number" },
            { name: "brand", label: "Brand" },
            { name: "category", label: "Category" },
            { name: "collection", label: "Collection" },
            { name: "material", label: "Material" },
            { name: "sizes", label: "Sizes (comma separated)" },
            { name: "colors", label: "Colors (comma separated)" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block font-medium mb-1">{field.label}</label>
              <input
                type={field.type || "text"}
                name={field.name}
                value={Array.isArray(productData[field.name]) ? productData[field.name].join(", ") : productData[field.name]}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            </div>
          ))}

          <div>
            <label className="block font-medium mb-1">Gender</label>
            <select
              name="gender"
              value={productData.gender}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows={4}
          />
        </div>

        <div>
          <h4 className="font-medium mb-2">Images</h4>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Image URL"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="border p-2 rounded flex-1"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
            >
              Add
            </button>
          </div>

          <div className="flex gap-3 flex-wrap">
            {productData.images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img.url}
                  alt={`Product ${index}`}
                  className="w-24 h-24 object-cover rounded shadow"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          {id ? "Save Changes" : "Add Product"}
        </button>
      </form>
    </div>
  );
}

export default Handleedit;
