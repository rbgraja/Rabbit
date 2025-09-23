import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Productsgrid from "./Productsgrid";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductDetail, similarProducts } from "../../redux/slices/productSlice";
import { addToCartAsync } from "../../redux/slices/cartSlice";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function ProductDetail({ productId: propProductId }) {
  const { id: paramId } = useParams();
  const dispatch = useDispatch();
  const productId = propProductId || paramId;

  const { selectedProduct, loading, error, similarProducts: similar } = useSelector(
    (state) => state.products || {}
  );
  const { user, guestId } = useSelector((state) => state.auth || {});

  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("default");
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const [colorOptions, setColorOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [thumbnailImages, setThumbnailImages] = useState([]);

  // Fetch product details
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductDetail(productId));
      dispatch(similarProducts({ id: productId }));
    }
  }, [dispatch, productId]);

  // Setup initial state after product load
  useEffect(() => {
    if (!selectedProduct) return;

    const images = selectedProduct.images || [];

    // Colors
    const normalizedColors = (selectedProduct.colors || selectedProduct.color || []).map(c =>
      typeof c === "string" ? { name: c || "Default", hex: "#ccc" } : { name: c.name || "Default", hex: c.hex || "#ccc" }
    );
    setColorOptions(normalizedColors);

    // Initial color
    const initialColor = normalizedColors[0] || { name: "Default", hex: "#ccc" };
    setSelectedColor(initialColor);

    // Sizes
    const normalizedSizes = Array.isArray(selectedProduct.sizes)
      ? selectedProduct.sizes
      : selectedProduct.size
      ? [selectedProduct.size]
      : ["default"];
    setSizeOptions(normalizedSizes);
    setSelectedSize(normalizedSizes[0] || "default");

    // Thumbnails for initial color
    const filteredThumbnails = images.filter(img => !img.alt || img.alt.toLowerCase() === initialColor.name.toLowerCase());
    setThumbnailImages(filteredThumbnails);

    // Main image
    setMainImage(filteredThumbnails[0]?.url || images[0]?.url || "/fallback.jpg");
  }, [selectedProduct]);

  const handleQuantityChange = (type) => {
    setQuantity((prev) => {
      if (type === "plus") {
        if (prev < selectedProduct?.stock) return prev + 1;
        toast.error(`Only ${selectedProduct?.stock} items available`);
        return prev;
      } else {
        return Math.max(1, prev - 1);
      }
    });
  };

 const handleAddToCart = () => {
  if (!selectedColor || !selectedColor.name || !selectedSize) {
    toast.error("Please select a size and color");
    return;
  }

  if (quantity > selectedProduct?.stock) {
    toast.error(`You can only add up to ${selectedProduct?.stock} items`);
    return;
  }

  setIsButtonDisabled(true);

  // Get first image of selected color
  const images = selectedProduct.images || [];
  const filteredImages = images.filter(
    (img) => img.alt?.toLowerCase() === selectedColor.name.toLowerCase()
  );
  const selectedImage = filteredImages[0]?.url || images[0]?.url || "/fallback.jpg";

  const cartItem = {
    productId,
    quantity,
    size: selectedSize?.trim().toLowerCase() || "default",
    color: {
      name: selectedColor?.name?.trim() || "Default",
      hex: selectedColor?.hex || "#ccc",
    },
    image: selectedImage, // ✅ send selected color's first image
    guestId,
    userId: user?._id,
  };

  dispatch(addToCartAsync(cartItem))
    .unwrap()
    .then(() => toast.success("Product added to cart!"))
    .catch(() => toast.error("Failed to add product to cart"))
    .finally(() => setIsButtonDisabled(false));
};


  const handleColorSelect = (color) => {
    setSelectedColor(color);
    const images = selectedProduct.images || [];
    const filteredThumbnails = images.filter(img => !img.alt || img.alt.toLowerCase() === color.name.toLowerCase());
    setThumbnailImages(filteredThumbnails);

    // Change main image to first image of selected color
    setMainImage(filteredThumbnails[0]?.url || images[0]?.url || "/fallback.jpg");
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Skeleton height={500} width="100%" baseColor="#eee" highlightColor="#f5f5f5" />
        <Skeleton height={30} width="40%" className="mt-4" />
        <Skeleton height={20} width="60%" className="mt-2" />
        <Skeleton height={20} width="80%" className="mt-2" />
      </div>
    );
  }

  if (error) return <p className="text-center text-red-500">Error: {error}</p>;
  if (!selectedProduct) return null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Thumbnails */}
          <div className="hidden md:flex flex-col space-y-4">
            {thumbnailImages.map((img, idx) => (
              <img
                key={idx}
                src={img?.url || "/fallback.jpg"}
                alt={img?.alt || `thumb-${idx}`}
                onClick={() => setMainImage(img?.url)}
                className={`w-20 h-20 object-cover rounded-md cursor-pointer border transition-transform duration-300 ${
                  mainImage === img?.url ? "border-black scale-105" : "border-gray-300 hover:border-black"
                }`}
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="md:w-1/2">
            <img
              key={mainImage}
              src={mainImage || "/fallback.jpg"}
              alt={selectedColor?.name || "main"}
              className="w-full h-[500px] object-cover rounded-lg shadow transition-all duration-500 ease-in-out"
            />
          </div>

          {/* Info */}
          <div className="md:w-1/2 space-y-5">
            <h1 className="text-3xl font-bold text-gray-900">{selectedProduct.name}</h1>
            <p className="text-2xl text-green-600 font-semibold">${selectedProduct.price}</p>
            <p className="text-gray-600">{selectedProduct.description}</p>
            <p className="text-sm text-gray-500">Stock: {selectedProduct?.stock ?? "N/A"}</p>

            {/* Color */}
            {colorOptions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Color:</p>
                <div className="flex flex-wrap gap-4 items-center">
                  {colorOptions.map((color, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <button
                        onClick={() => handleColorSelect(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-transform duration-300 ${
                          selectedColor?.name === color.name ? "border-black scale-110" : "border-gray-300 hover:border-black"
                        }`}
                        style={{ backgroundColor: color.hex || "#ccc" }}
                        title={color.name}
                      />
                      <span
                        className={`mt-1 text-xs font-medium transition-colors duration-150 ${
                          selectedColor?.name === color.name ? "text-black" : "text-gray-500"
                        }`}
                      >
                        {color.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {sizeOptions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Size:</p>
                <div className="flex flex-wrap gap-3">
                  {sizeOptions.map((size, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] text-center py-2 px-4 rounded-md text-sm font-medium transition duration-200 border shadow-sm ${
                        selectedSize === size
                          ? "bg-black text-white border-black scale-105"
                          : "border-gray-300 text-gray-700 hover:border-black hover:text-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Quantity:</p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleQuantityChange("minus")}
                  className="bg-gray-200 hover:bg-gray-300 text-xl px-3 rounded-full"
                >
                  -
                </button>
                <span className="font-medium text-lg">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange("plus")}
                  className="bg-gray-200 hover:bg-gray-300 text-xl px-3 rounded-full"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={isButtonDisabled}
              className={`w-full py-3 text-white text-lg rounded-md font-semibold transition ${
                isButtonDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
              }`}
            >
              {isButtonDisabled ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>

        {/* Similar Products */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">You may also like</h2>
          <Productsgrid products={similar} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
