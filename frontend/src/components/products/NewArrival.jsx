import React, { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const BASE_URL = import.meta.env.VITE_BACKGROUND_URL;

function NewArrival() {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollLeftVisible, setScrollLeftVisible] = useState(false);
  const [scrollRightVisible, setScrollRightVisible] = useState(true);

  // 🛍️ Fetch latest products (unfiltered by gender)
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/products/new-arrivals?limit=12`
        );
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("New Arrival fetch failed:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  const updateScrollButtons = () => {
    const container = scrollRef.current;
    if (!container) return;
    const { scrollLeft, clientWidth, scrollWidth } = container;
    setScrollLeftVisible(scrollLeft > 0);
    setScrollRightVisible(scrollLeft + clientWidth < scrollWidth);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
      updateScrollButtons();
    }
    return () => container?.removeEventListener("scroll", updateScrollButtons);
  }, []);

  const scrollLeftByButton = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRightByButton = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = "grabbing";
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
    scrollRef.current.style.cursor = "grab";
  };

  return (
    <section className="py-10 px-4">
      <div className="mx-auto text-center mb-10 relative">
        <h2 className="text-3xl font-bold mb-4">Explore New Arrivals</h2>
        <p className="text-lg text-gray-600 mb-4">
          Discover our newest collection. Fresh fashion, unique designs, and comfortable fits all in one place.
        </p>

        <div className="absolute right-0 bottom-[-30px] flex space-x-2">
          <button
            onClick={scrollLeftByButton}
            className={`p-2 rounded border bg-white text-black transition-opacity duration-300 ${
              scrollLeftVisible ? "" : "opacity-50 cursor-not-allowed"
            }`}
          >
            <FiChevronLeft className="text-2xl" />
          </button>
          <button
            onClick={scrollRightByButton}
            className={`p-2 rounded border bg-white text-black transition-opacity duration-300 ${
              scrollRightVisible ? "" : "opacity-50 cursor-not-allowed"
            }`}
          >
            <FiChevronRight className="text-2xl" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="mx-auto overflow-x-auto flex space-x-6 scroll-smooth scrollbar-hide cursor-grab"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {loading ? (
          // 🔹 Skeleton Loader
          Array(4).fill().map((_, i) => (
            <div key={i} className="min-w-[100%] sm:min-w-[50%] lg:min-w-[30%] relative">
              <Skeleton height={500} className="rounded-lg" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <Skeleton height={20} width={`60%`} />
                <Skeleton height={20} width={`40%`} />
              </div>
            </div>
          ))
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">No new products found.</p>
        ) : (
          products.map((product) => {
            const img = product?.images?.[0];
            const imageUrl = img?.url
              ? img.url.startsWith("http")
                ? img.url
                : `${BASE_URL}/${img.url}`
              : null;

            return (
              <div
                key={product._id}
                className="min-w-[100%] sm:min-w-[50%] lg:min-w-[30%] relative"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={img?.alt || product.name}
                    className="w-full h-[500px] rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center text-gray-500 rounded-lg">
                    No Image Available
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-md text-white p-4 rounded-b-lg">
                  <Link to={`/product/${product._id}`}>
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="mt-1">${product.price}</p>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default NewArrival;
