import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminTestimonials,
  deleteAdminTestimonial,
  updateAdminTestimonial,
} from "../../redux/slices/adminTestimonialSlice";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function AdminTestimonials() {
  const dispatch = useDispatch();
  const { testimonials, loading, error } = useSelector(
    (state) => state.adminTestimonials
  );
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminTestimonials());
  }, [dispatch]);

  // Approve / Unapprove
  const toggleApprove = async (id, currentStatus) => {
    setUpdatingId(id);
    try {
      await dispatch(
        updateAdminTestimonial({ id, updates: { approved: !currentStatus } })
      ).unwrap();
    } catch (err) {
      alert(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?"))
      return;
    setUpdatingId(id);
    try {
      await dispatch(deleteAdminTestimonial(id)).unwrap();
    } catch (err) {
      alert(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">💬 Admin - Manage Testimonials</h2>

      {loading && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-xs uppercase">
              <tr>
                {["Name", "Title", "Rating", "Comment", "Images", "Status", "Actions"].map(
                  (h) => (
                    <th key={h} className="py-3 px-4">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="py-3 px-4">
                      <Skeleton />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <p className="text-red font-semibold mb-4">Error: {error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-xs uppercase">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Comment</th>
                <th className="py-3 px-4">Images</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-gray-500 italic">
                    🚫 No testimonials found
                  </td>
                </tr>
              ) : (
                testimonials.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50 align-top">
                    <td className="py-3 px-4 font-medium">{t.name}</td>
                    <td className="py-3 px-4">{t.title || "-"}</td>
                    <td className="py-3 px-4">⭐ {t.rating}</td>
                    <td className="py-3 px-4 max-w-xs break-words">{t.comment}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        {t.images && t.images.length > 0 ? (
                          t.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img.url}
                              alt={img.alt || `Image ${idx}`}
                              className="w-16 h-16 object-cover rounded border"
                            />
                          ))
                        ) : (
                          <span className="text-gray-400">No images</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {t.approved ? (
                        <span className="text-green-600 font-semibold">Approved</span>
                      ) : (
                        <span className="text-red font-semibold">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center space-x-2 flex flex-col sm:flex-row justify-center items-center gap-2">
                      <button
                        disabled={updatingId === t._id}
                        onClick={() => toggleApprove(t._id, t.approved)}
                        className={`px-3 py-1 rounded text-white text-sm ${
                          t.approved ? "bg-yellow-500" : "bg-green-600"
                        }`}
                      >
                        {t.approved ? "Unapprove" : "Approve"}
                      </button>
                      <button
                        disabled={updatingId === t._id}
                        onClick={() => handleDelete(t._id)}
                        className="px-3 py-1 rounded bg-red text-white text-sm"
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
      )}
    </div>
  );
}

export default AdminTestimonials;
