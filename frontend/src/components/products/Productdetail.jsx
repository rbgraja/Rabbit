import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Productsgrid from "./Productsgrid";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductDetail,
  similarProducts,
} from "../../redux/slices/productSlice";
import { addToCartAsync } from "../../redux/slices/cartSlice";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// ✅ Swiper for mobile flipper
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function ProductDetail({ productId: propProductId }) {
  const { id: paramId } = useParams();
  const dispatch = useDispatch();
  const productId = propProductId || paramId;

  const { selectedProduct, loading, error, similarProducts: similar } =
    useSelector((state) => state.products || {});
  const { user, guestId } = useSelector((state) => state.auth || {});

  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("default");
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const [colorOptions, setColorOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [thumbnailImages, setThumbnailImages] = useState([]);

  // ✅ Review state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

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
    const normalizedColors = (
      selectedProduct.colors || selectedProduct.color || []
    ).map((c) =>
      typeof c === "string"
        ? { name: c || "Default", hex: "#ccc" }
        : { name: c.name || "Default", hex: c.hex || "#ccc" }
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
    const filteredThumbnails = images.filter(
      (img) =>
        !img.alt || img.alt.toLowerCase() === initialColor.name.toLowerCase()
    );
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

    const images = selectedProduct.images || [];
    const filteredImages = images.filter(
      (img) => img.alt?.toLowerCase() === selectedColor.name.toLowerCase()
    );
    const selectedImage =
      filteredImages[0]?.url || images[0]?.url || "/fallback.jpg";

    const cartItem = {
      productId,
      quantity,
      size: selectedSize?.trim().toLowerCase() || "default",
      color: {
        name: selectedColor?.name?.trim() || "Default",
        hex: selectedColor?.hex || "#ccc",
      },
      image: selectedImage,
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
    const filteredThumbnails = images.filter(
      (img) => !img.alt || img.alt.toLowerCase() === color.name.toLowerCase()
    );
    setThumbnailImages(filteredThumbnails);
    setMainImage(
      filteredThumbnails[0]?.url || images[0]?.url || "/fallback.jpg"
    );
  };

  const getToken = (token) => token || localStorage.getItem("userToken");

  // ✅ Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }
    if (!rating || !comment.trim()) {
      toast.error("Please provide both rating and comment");
      return;
    }

    try {
      setSubmittingReview(true);

      const authToken = getToken(user.token);
      if (!authToken) throw new Error("No token found");

      const res = await fetch(
        `${import.meta.env.VITE_BACKGROUND_URL}/api/products/${productId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ rating, comment }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");

      toast.success("Review submitted!");
      setRating(0);
      setComment("");
      dispatch(fetchProductDetail(productId)); // Refresh product detail
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  // ✅ Calculate average rating from reviews
// ✅ Calculate average rating safely
const averageRating =
  selectedProduct?.reviews?.length > 0
    ? selectedProduct.reviews.reduce((acc, r) => acc + r.rating, 0) /
      selectedProduct.reviews.length
    : selectedProduct?.rating || 0;

// ✅ Number of reviews safely
const numReviews = selectedProduct?.reviews?.length ?? selectedProduct?.numReviews ?? 0;


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
          {/* Thumbnails - only desktop */}
          <div className="hidden md:flex flex-col space-y-4">
            {thumbnailImages.map((img, idx) => (
              <img
                key={idx}
                src={img?.url || "/fallback.jpg"}
                alt={img?.alt || `thumb-${idx}`}
                onClick={() => setMainImage(img?.url)}
                className={`w-20 h-20 object-cover rounded-md cursor-pointer border transition-transform duration-300 ${
                  mainImage === img?.url
                    ? "border-black scale-105"
                    : "border-gray-300 hover:border-black"
                }`}
              />
            ))}
          </div>

          {/* Main Image with flipper on mobile */}
          <div className="md:w-1/2 w-full">
            <div className="block md:hidden">
              <Swiper
                modules={[Pagination]}
                spaceBetween={10}
                slidesPerView={1}
                pagination={{ clickable: true }}
              >
                {thumbnailImages.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <img
                      src={img?.url || "/fallback.jpg"}
                      alt={img?.alt || `slide-${idx}`}
                      className="w-full object-cover rounded-lg shadow"
                      onClick={() => setMainImage(img?.url)}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="hidden md:block">
              <img
                key={mainImage}
                src={mainImage || "/fallback.jpg"}
                alt={selectedColor?.name || "main"}
                className="w-full object-cover rounded-lg shadow transition-all duration-500 ease-in-out"
              />
            </div>
          </div>

          {/* Info */}
          <div className="md:w-1/2 space-y-5">
            <h1 className="text-3xl font-bold text-gray-900">{selectedProduct.name}</h1>

            {selectedProduct.brand && (
              <p className="text-sm text-gray-600">
                Brand:
                <span className="font-semibold text-gray-800 ml-1">
                  {selectedProduct.brand}
                </span>
              </p>
            )}

            {/* ✅ Rating Section */}
            <div className="flex items-center space-x-2 mt-2">
  {[1, 2, 3, 4, 5].map((star) => (
    <svg
      key={star}
      xmlns="http://www.w3.org/2000/svg"
      fill={star <= Math.round(averageRating) ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      className={`w-5 h-5 ${
        star <= Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"
      }`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.05 6.319a1 1 0 00.95.69h6.63c.969 0 1.371 1.24.588 1.81l-5.37 3.905a1 1 0 00-.364 1.118l2.05 6.319c.3.922-.755 1.688-1.54 1.118l-5.37-3.905a1 1 0 00-1.176 0l-5.37 3.905c-.785.57-1.84-.196-1.54-1.118l2.05-6.319a1 1 0 00-.364-1.118L2.331 11.75c-.783-.57-.38-1.81.588-1.81h6.63a1 1 0 00.95-.69l2.05-6.319z"
      />
    </svg>
  ))}

  <span className="text-sm text-gray-600 ml-2">
    {averageRating.toFixed(1)} / 5
    {numReviews > 0 && <span className="ml-1">({numReviews} Reviews)</span>}
  </span>
</div>


            {/* Price */}
            {selectedProduct.discount > 0 ? (
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-red-600">
                  ${(
                    selectedProduct.price -
                    (selectedProduct.price * selectedProduct.discount) / 100
                  ).toFixed(2)}
                </span>
                <span className="line-through text-gray-500 text-lg">
                  ${selectedProduct.price}
                </span>
                <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">
                  -{selectedProduct.discount}%
                </span>
              </div>
            ) : (
              <p className="text-2xl text-green-600 font-semibold">
                ${selectedProduct.price}
              </p>
            )}

            <p className="text-gray-600">{selectedProduct.description}</p>
            <p className="text-sm text-gray-500">
              Stock: {selectedProduct?.stock ?? "N/A"}
            </p>

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
                          selectedColor?.name === color.name
                            ? "border-black scale-110"
                            : "border-gray-300 hover:border-black"
                        }`}
                        style={{ backgroundColor: color.hex || "#ccc" }}
                        title={color.name}
                      />
                      <span
                        className={`mt-1 text-xs font-medium transition-colors duration-150 ${
                          selectedColor?.name === color.name
                            ? "text-black"
                            : "text-gray-500"
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
                isButtonDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }`}
            >
              {isButtonDisabled ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>

        {/* ✅ Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Customer Reviews</h2>

          {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
            <div className="space-y-6">
              {selectedProduct.reviews.map((review, idx) => (
                <div key={idx} className="border-b pb-4">
                  <p className="font-semibold text-gray-800">{review.name}</p>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        fill={star <= review.rating ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className={`w-4 h-4 ${
                          star <= review.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.05 6.319a1 1 0 00.95.69h6.63c.969 0 1.371 1.24.588 1.81l-5.37 3.905a1 1 0 00-.364 1.118l2.05 6.319c.3.922-.755 1.688-1.54 1.118l-5.37-3.905a1 1 0 00-1.176 0l-5.37 3.905c-.785.57-1.84-.196-1.54-1.118l2.05-6.319a1 1 0 00-.364-1.118L2.331 11.75c-.783-.57-.38-1.81.588-1.81h6.63a1 1 0 00.95-.69l2.05-6.319z"
                        />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mt-1">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No reviews yet.</p>
          )}

          {/* Review Form */}
          <form onSubmit={handleSubmitReview} className="mt-8 space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Write a Review</h3>

            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-6 h-6 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-black focus:outline-none"
              rows="4"
              placeholder="Write your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button
              type="submit"
              disabled={submittingReview}
              className={`px-6 py-3 rounded-md font-semibold text-white transition ${
                submittingReview
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }`}
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>

      {/* Similar Products */}
      <Productsgrid
        title="Similar Products"
        products={similar || []}
        loading={loading}
        error={error}
      />
    </div>
  );
}

export default ProductDetail;
