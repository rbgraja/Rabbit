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
    images: [], // {file, alt, url(optional)}
    isFeatured: false,
    isActive: true,
    isPublished: false,
  };

  const [productData, setProductData] = useState(fallbackProduct);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageAlt, setUploadedImageAlt] = useState("");

  // Fetch product
  useEffect(() => {
    if (id) dispatch(getAdminProductById(id));
    return () => dispatch(clearProductDetail());
  }, [id, dispatch]);

  // Populate state when product detail arrives
  useEffect(() => {
    if (productDetail && id) {
      setProductData({
        ...fallbackProduct,
        ...productDetail,
        sizes: Array.isArray(productDetail.sizes)
          ? productDetail.sizes
          : String(productDetail.sizes || "").split(",").map(v => v.trim()),
        colors: Array.isArray(productDetail.colors)
          ? productDetail.colors.map(c => typeof c === "string" ? { hex: c, name: "" } : c)
          : [],
        gender: ["Men", "Women", "Unisex"].includes(productDetail.gender) ? productDetail.gender : "Unisex",
        images: Array.isArray(productDetail.images)
          ? productDetail.images.map(img => ({ url: img.url, alt: img.alt || "" }))
          : [],
      });
    }
  }, [productDetail, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "price" || name === "stock") {
      setProductData({ ...productData, [name]: Number(value) });
    } else if (name === "sizes") {
      setProductData({ ...productData, sizes: value.split(",").map(v => v.trim()) });
    } else {
      setProductData({ ...productData, [name]: value });
    }
  };

  const handleColorChange = (index, key, value) => {
    setProductData(prev => {
      const newColors = [...prev.colors];
      newColors[index] = { ...newColors[index], [key]: value };
      return { ...prev, colors: newColors };
    });
  };

  const handleAddColor = () => {
    setProductData(prev => ({ ...prev, colors: [...prev.colors, { hex: "#000000", name: "" }] }));
  };

  const handleRemoveColor = (index) => {
    setProductData(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }));
  };

  // Add file to local state (do NOT upload yet)
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setProductData(prev => ({
    ...prev,
    images: [...prev.images, { file, alt: uploadedImageAlt.trim() || file.name }]
  }));
  setUploadedImageAlt("");
};
const handleRemoveImage = (index) => {
  setProductData(prev => ({
    ...prev,
    images: prev.images.filter((_, i) => i !== index)
  }));
};

 // Submit handler (image part)
const handleSubmit = async (e) => {
  e.preventDefault();
  setUploading(true);
  try {
    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("price", productData.price);
    formData.append("stock", productData.stock);
    formData.append("sku", productData.sku);
    formData.append("brand", productData.brand);
    formData.append("collection", productData.collection);
    formData.append("material", productData.material);
    formData.append("gender", productData.gender);
    formData.append("isFeatured", productData.isFeatured);
    formData.append("isActive", productData.isActive);
    formData.append("isPublished", productData.isPublished);
    formData.append("category", productData.category);
    formData.append("sizes", JSON.stringify(productData.sizes));
    formData.append("colors", JSON.stringify(productData.colors));

    // Append new image files
    productData.images.forEach(img => {
      if (img.file) formData.append("images", img.file);
    });

      // Always send alt text + existing URLs to backend
    const imagesData = productData.images.map(img => ({
      url: img.url || null, // existing image URLs
      alt: img.alt?.trim() || img.file?.name || "" // priority: alt input > file name
    }));
    formData.append("imagesData", JSON.stringify(imagesData));

    const token = localStorage.getItem("userToken");

    if (id) {
      await axios.put(`${BASE_URL}/api/admin/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
    } else {
      await axios.post(`${BASE_URL}/api/admin/products`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
    }

    alert("✅ Product saved successfully!");
    navigate("/admin/products");
  } catch (err) {
    console.error(err);
    alert("❌ Failed to save product");
  } finally {
    setUploading(false);
  }
};


  if (loading || uploading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <div className="text-center">
          <Skeleton height={50} width={200} className="mb-4" />
          <p className="text-gray-700">{uploading ? "Uploading images..." : "Loading product..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md bg-white relative">
      <h2 className="text-3xl font-bold mb-6">{id ? "Edit Product" : "Add New Product"}</h2>
      {error && <p className="text-red-600 mb-4 font-medium bg-red-100 p-3 rounded">⚠️ {error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["name","sku","price","stock","brand","category","collection","material","sizes"].map(field => (
            <div key={field}>
              <label className="block font-medium mb-1">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                type={field === "price" || field === "stock" ? "number" : "text"}
                name={field}
                value={Array.isArray(productData[field]) ? productData[field].join(", ") : (productData[field] || "")}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            </div>
          ))}
          <div>
            <label className="block font-medium mb-1">Gender</label>
            <select name="gender" value={productData.gender || "Unisex"} onChange={handleChange} className="border p-2 rounded w-full">
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
              <input type="color" value={color.hex || "#000000"} onChange={e=>handleColorChange(index,"hex",e.target.value)} className="w-12 h-10 border rounded"/>
              <input type="text" placeholder="Color name" value={color.name || ""} onChange={e=>handleColorChange(index,"name",e.target.value)} className="border p-2 rounded flex-1"/>
              <button type="button" onClick={()=>handleRemoveColor(index)} className="bg-red-600 text-white px-2 py-1 rounded">❌</button>
            </div>
          ))}
          <button type="button" onClick={handleAddColor} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">➕ Add Color</button>
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea name="description" value={productData.description || ""} onChange={handleChange} className="border p-2 rounded w-full" rows={4}/>
        </div>

        {/* Images */}
        <div>
          <h4 className="font-medium mb-2">Images</h4>
          <div className="mb-2 flex flex-col gap-2">
            <input type="file" accept="image/*" onChange={handleFileUpload} className="border p-2 rounded w-full" disabled={uploading}/>
            <input type="text" placeholder="Alt text for image" value={uploadedImageAlt || ""} onChange={e=>setUploadedImageAlt(e.target.value)} className="border p-2 rounded w-full"/>
          </div>
          <div className="flex gap-3 flex-wrap">
            {productData.images.map((img,index)=>(
              <div key={index} className="relative group">
                <img src={img.url || (img.file && URL.createObjectURL(img.file))} alt={img.alt || `Product ${index}`} className="w-24 h-24 object-cover rounded shadow"/>
                <input type="text" value={img.alt || ""} onChange={e=>{
                  const newImages = [...productData.images];
                  newImages[index].alt = e.target.value;
                  setProductData(prev => ({ ...prev, images:newImages }));
                }} placeholder="Alt text" className="border p-1 mt-1 rounded w-full text-xs"/>
                <button type="button" onClick={()=>handleRemoveImage(index)} className="absolute top-2 right-2 bg-red-600 text-black text-lg px-2 py-1 ">🗑</button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" disabled={uploading || loading}>
          {id ? "Save Changes" : "Add Product"}
        </button>
      </form>
    </div>
  );
}

export default Handleedit;
