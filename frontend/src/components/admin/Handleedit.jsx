// src/pages/admin/Handleedit.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getAdminProductById,
  updateProduct,
  createProduct,
  clearProductDetail,
} from "../../redux/slices/adminProductSlice";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const BASE_URL = import.meta.env.VITE_BACKGROUND_URL;

function Handleedit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const adminProductState = useSelector((state) => state.adminProduct) || {};
  const { productDetail = null, loading = false, error = null } = adminProductState;

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
  const [newImageAlt, setNewImageAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedImageAlt, setUploadedImageAlt] = useState("");

  useEffect(() => {
    if (id) dispatch(getAdminProductById(id));
    return () => dispatch(clearProductDetail());
  }, [id, dispatch]);

  useEffect(() => {
    if (productDetail && id) {
      setProductData({
        ...fallbackProduct,
        ...productDetail,
        sizes: Array.isArray(productDetail.sizes)
          ? productDetail.sizes
          : String(productDetail.sizes || "")
              .split(",")
              .map((v) => v.trim()),
        colors: Array.isArray(productDetail.colors)
          ? productDetail.colors.map((c) =>
              typeof c === "string" ? { hex: c, name: "" } : c
            )
          : [],
        gender: ["Men", "Women", "Unisex"].includes(productDetail.gender)
          ? productDetail.gender
          : "Unisex",
        images: Array.isArray(productDetail.images)
          ? productDetail.images.map((img) => ({ url: img.url, alt: img.alt || "" }))
          : [],
      });
    }
  }, [productDetail, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "price" || name === "stock") {
      setProductData({ ...productData, [name]: Number(value) });
    } else if (name === "sizes") {
      setProductData({
        ...productData,
        sizes: value.split(",").map((v) => v.trim()),
      });
    } else {
      setProductData({ ...productData, [name]: value });
    }
  };

  const handleColorChange = (index, key, value) => {
    setProductData((prev) => {
      const newColors = [...prev.colors];
      newColors[index] = { ...newColors[index], [key]: value };
      return { ...prev, colors: newColors };
    });
  };

  const handleAddColor = () => {
    setProductData((prev) => ({
      ...prev,
      colors: [...prev.colors, { hex: "#000000", name: "" }],
    }));
  };

  const handleRemoveColor = (index) => {
    setProductData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setProductData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        { url: newImageUrl.trim(), alt: newImageAlt.trim() || "Product Image" },
      ],
    }));
    setNewImageUrl("");
    setNewImageAlt("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.post(`${BASE_URL}/api/admin/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (!res.data?.url) throw new Error("No URL returned from Cloudinary");

      setProductData((prev) => ({
        ...prev,
        images: [
          ...prev.images,
          {
            url: res.data.url,
            alt: uploadedImageAlt.trim() || file.name || "Product Image",
          },
        ],
      }));
      setUploadedImageAlt("");
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("❌ Image upload failed");
    } finally {
      setUploading(false);
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

    // Sanitize and ensure safe defaults
   const safeImages = (productData.images || [])
  .filter(img => img.url && img.url.trim() !== "")
  .map(img => ({
    url: img.url.trim(),
    alt: img.alt?.trim() || "Product Image",
  }));

const payload = {
  ...productData,
  images: safeImages,
  colors: (productData.colors || []).map(c => ({
    hex: c.hex || "#000000",
    name: c.name || "",
  })),
  sizes: Array.isArray(productData.sizes) ? productData.sizes : [],
  name: productData.name || "Untitled Product",
  sku: productData.sku || "",
  price: Number(productData.price) || 0,
  stock: Number(productData.stock) || 0,
  category: productData.category || "",
  brand: productData.brand || "",
  collection: productData.collection || "",
  material: productData.material || "",
  gender: ["Men", "Women", "Unisex"].includes(productData.gender)
    ? productData.gender
    : "Unisex",
  isFeatured: !!productData.isFeatured,
  isActive: productData.isActive !== undefined ? productData.isActive : true,
  isPublished: productData.isPublished !== undefined ? productData.isPublished : false,
};


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
      alert("❌ Failed to save product: " + (err?.message || err));
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md bg-white">
        <Skeleton height={40} width="50%" className="mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i}>
              <Skeleton height={20} width="40%" className="mb-2" />
              <Skeleton height={38} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md bg-white">
      <h2 className="text-3xl font-bold mb-6">{id ? "Edit Product" : "Add New Product"}</h2>
      {error && (
        <p className="text-red-600 mb-4 font-medium bg-red-100 p-3 rounded">
          ⚠️ {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["name","sku","price","stock","brand","category","collection","material","sizes"].map((field) => (
            <div key={field}>
              <label className="block font-medium mb-1">{field.charAt(0).toUpperCase()+field.slice(1)}</label>
              <input
                type={field==="price"||field==="stock"?"number":"text"}
                name={field}
                value={Array.isArray(productData[field]) ? productData[field].join(", ") : productData[field]}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            </div>
          ))}
          <div>
            <label className="block font-medium mb-1">Gender</label>
            <select name="gender" value={productData.gender} onChange={handleChange} className="border p-2 rounded w-full">
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
        </div>

        {/* Colors */}
        <div>
          <h4 className="font-medium mb-2">Colors</h4>
          {productData.colors.map((color,index)=>(
            <div key={index} className="flex gap-2 mb-2 items-center">
              <input type="color" value={color.hex} onChange={e=>handleColorChange(index,"hex",e.target.value)} className="w-12 h-10 border rounded"/>
              <input type="text" placeholder="Color name (optional)" value={color.name} onChange={e=>handleColorChange(index,"name",e.target.value)} className="border p-2 rounded flex-1"/>
              <button type="button" onClick={()=>handleRemoveColor(index)} className="bg-red-600 text-white px-2 py-1 rounded">❌</button>
            </div>
          ))}
          <button type="button" onClick={handleAddColor} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">➕ Add Color</button>
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea name="description" value={productData.description} onChange={handleChange} className="border p-2 rounded w-full" rows={4}/>
        </div>

        {/* Images */}
        <div>
          <h4 className="font-medium mb-2">Images</h4>
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input type="text" placeholder="Image URL" value={newImageUrl} onChange={e=>setNewImageUrl(e.target.value)} className="border p-2 rounded flex-1"/>
            <input type="text" placeholder="Color/Alt" value={newImageAlt} onChange={e=>setNewImageAlt(e.target.value)} className="border p-2 rounded flex-1"/>
            <button type="button" onClick={handleAddImage} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add Image</button>
          </div>
          <div className="mb-2 flex flex-col gap-2">
            <input type="file" accept="image/*" onChange={handleFileUpload} className="border p-2 rounded w-full" disabled={uploading}/>
            <input type="text" placeholder="Color/Alt for uploaded image" value={uploadedImageAlt} onChange={e=>setUploadedImageAlt(e.target.value)} className="border p-2 rounded w-full"/>
            {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
          </div>

          <div className="flex gap-3 flex-wrap">
            {productData.images.map((img,index)=>(
              <div key={index} className="relative group">
                <img src={img.url} alt={img.alt || `Product ${index}`} className="w-24 h-24 object-cover rounded shadow"/>
                <input type="text" value={img.alt} onChange={e=>{
                  const newImages = [...productData.images];
                  newImages[index].alt = e.target.value;
                  setProductData(prev=>({...prev, images:newImages}));
                }} placeholder="Color/Alt" className="border p-1 mt-1 rounded w-full text-xs"/>
                <button type="button" onClick={()=>handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-700 transition">🗑</button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">{id?"Save Changes":"Add Product"}</button>
      </form>
    </div>
  );
}

export default Handleedit;
