import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTestimonials } from "../redux/slices/testimonialSlice";
import { useNavigate } from "react-router-dom";
import { FaCommentAlt } from "react-icons/fa";
function Testimonial() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { testimonials, loading, error } = useSelector(
    (state) => state.testimonial
  );

  // ✅ Fetch testimonials on mount
  useEffect(() => {
    dispatch(fetchTestimonials({ page: 1, limit: 10 }));
  }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        User Testimonials
      </h2>

      {/* ✅ Testimonials List */}
      <div>
        {loading && <p>Loading testimonials...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {!loading && testimonials.length === 0 && (
          <p className="text-gray-600 text-center">No testimonials yet.</p>
        )}

        <div className="space-y-6">
          {(testimonials || []).map((t) => (
            <div
              key={t._id}
              className="bg-white p-6 rounded-xl shadow-md border"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-lg">{t.title || "Untitled"}</h4>
                <span className="text-yellow-500 font-medium">⭐ {t.rating}</span>
              </div>
              <p className="text-gray-700">{t.comment}</p>

              {/* ✅ Show testimonial images */}
              {t.images && t.images.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {t.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={`testimonial-${idx}`}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              )}

              <small className="block text-gray-500 mt-3">
                by {t.name}{" "}
                {t.createdAt
                  ? ` • ${new Date(t.createdAt).toLocaleDateString()}`
                  : ""}
              </small>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Feedback Button */}
      <div className="text-center mt-10">
        <button
          onClick={() => navigate("/give-feedback")}
          className= " inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md"
        >
          <FaCommentAlt className="w-5 h-5" />

          Give Us Your Feedback
        </button>
      </div>
    </div>
  );
}

export default Testimonial;
