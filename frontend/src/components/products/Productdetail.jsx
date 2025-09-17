import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Productsgrid from './Productsgrid';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProductDetail,
  similarProducts,
} from '../../redux/slices/productSlice';
import { addToCartAsync } from '../../redux/slices/cartSlice';

function Productdetail({ productId: propProductId }) {
  const { id: paramId } = useParams();
  const dispatch = useDispatch();
  const productId = propProductId || paramId;

  const {
    selectedProduct,
    loading,
    error,
    similarProducts: similar,
  } = useSelector((state) => state.products);

  const { user, guestId } = useSelector((state) => state.auth);

  const [mainImage, setMainImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const colorOptions = Array.isArray(selectedProduct?.colors)
    ? selectedProduct.colors
    : selectedProduct?.color
    ? [selectedProduct.color]
    : [];

  const sizeOptions = Array.isArray(selectedProduct?.sizes)
    ? selectedProduct.sizes
    : selectedProduct?.size
    ? [selectedProduct.size]
    : [];

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductDetail(productId));
      dispatch(similarProducts({ id: productId }));
    }
  }, [dispatch, productId]);

  useEffect(() => {
    if (!selectedProduct) return;

    console.log("📦 Product detail fetched:", selectedProduct);

    if (selectedProduct.images?.length > 0) {
      setMainImage(selectedProduct.images[0].url);
    }

    if (colorOptions.length > 0) {
      setSelectedColor(colorOptions[0]);
    }

    if (sizeOptions.length > 0) {
      setSelectedSize(sizeOptions[0]);
    }
  }, [selectedProduct]);

  const handleQuantityChange = (type) => {
    setQuantity((prev) => {
      if (type === 'plus') {
        if (prev < selectedProduct?.stock) {
          return prev + 1;
        } else {
          toast.error(`Only ${selectedProduct?.stock} items available in stock`);
          return prev;
        }
      } else {
        return Math.max(1, prev - 1);
      }
    });
  };

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      toast.error('Please select a size and color');
      return;
    }

    if (quantity > selectedProduct?.stock) {
      toast.error(`You can only add up to ${selectedProduct?.stock} items`);
      return;
    }

    setIsButtonDisabled(true);

    const cartItem = {
      productId,
      quantity,
      size: selectedSize.trim().toLowerCase(),
      color: formatColor(selectedColor),
      guestId,
      userId: user?._id,
    };

    dispatch(addToCartAsync(cartItem))
      .unwrap()
      .then(() => toast.success('Product added to cart!'))
      .catch(() => toast.error('Failed to add product to cart'))
      .finally(() => setIsButtonDisabled(false));
  };

  if (loading) return <p className="text-center text-gray-500">Loading product...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;
  if (!selectedProduct) return null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Thumbnails */}
          <div className="hidden md:flex flex-col space-y-4">
            {selectedProduct.images?.map((img, idx) => (
              <img
                key={idx}
                src={img?.url || '/fallback.jpg'}
                alt={`thumb-${idx}`}
                onClick={() => setMainImage(img?.url)}
                className={`w-20 h-20 object-cover rounded-md cursor-pointer border transition ${
                  mainImage === img?.url
                    ? 'border-black scale-105'
                    : 'border-gray-300 hover:border-black'
                }`}
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="md:w-1/2">
            <img
              src={mainImage || '/fallback.jpg'}
              alt="main"
              className="w-full h-[500px] object-cover rounded-lg shadow"
            />
          </div>

          {/* Info */}
          <div className="md:w-1/2 space-y-5">
            <h1 className="text-3xl font-bold text-gray-900">{selectedProduct.name}</h1>
            <p className="text-2xl text-green-600 font-semibold">${selectedProduct.price}</p>
            <p className="text-gray-600">{selectedProduct.description}</p>

            <p className="text-sm text-gray-500">
              Available stock: {selectedProduct?.stock ?? "N/A"}
            </p>

            {/* Color */}
            {colorOptions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Color:</p>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 ${
                        selectedColor === color
                          ? 'border-black scale-110'
                          : 'border-gray-300 hover:border-black'
                      }`}
                      style={{
                        backgroundColor: formatColor(color),
                      }}
                      title={color}
                    />
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
                          ? 'bg-black text-white border-black scale-105'
                          : 'border-gray-300 text-gray-700 hover:border-black hover:text-black'
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
                  onClick={() => handleQuantityChange('minus')}
                  className="bg-gray-200 hover:bg-gray-300 text-xl px-3 rounded-full"
                >
                  -
                </button>
                <span className="font-medium text-lg">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange('plus')}
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
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800'
              }`}
            >
              {isButtonDisabled ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Similar Products */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">You may also like</h2>
          <Productsgrid products={similar} />
        </div>
      </div>
    </div>
  );
}

/* ------------------ Custom Color Mapping ------------------ */
const customColors = {
  "floralprint": "#ffb6c1",      // example light pink
  "sunsetorange": "#ff4500",      // example orange
  "Tropical Print": "#87ceeb",
  "lightgreen": "#90ee90",
  // 🔹 Aage bhi yahan custom colors add kar sakte ho
  // "midnightblue": "#191970",
  // "peach": "#ffcba4",
};

function formatColor(colorStr) {
  if (!colorStr) return "#ccc";
  const key = colorStr.toLowerCase().replace(/\s+/g, ""); // remove spaces for mapping
  if (customColors[key]) return customColors[key];

  // Agar standard CSS color hai to use karo
  const s = new Option().style;
  s.color = colorStr.toLowerCase().replace(/\s+/g, "");
  return s.color !== "" ? s.color : "#ccc"; // fallback gray
}

export default Productdetail;
