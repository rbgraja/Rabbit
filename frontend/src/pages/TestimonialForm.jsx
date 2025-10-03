import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKGROUND_URL;

function TestimonialForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    title: "",
    comment: "",
    images: [],
  });
  const [uploading, setUploading] = useState(false);

  // handle text input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle multiple image uploads
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImgs = files.map((file) => ({
      file,
      alt: file.name,
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImgs],
    }));
  };

  // remove image
  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.comment.trim()) {
      alert("⚠️ Name and Comment are required");
      return;
    }
    if (formData.rating < 1 || formData.rating > 5) {
      alert("⚠️ Rating must be between 1 and 5");
      return;
    }

    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("email", formData.email);
      fd.append("rating", formData.rating);
      fd.append("title", formData.title);
      fd.append("comment", formData.comment);

      // images
      formData.images.forEach((img) => {
        if (img.file) fd.append("images", img.file);
      });

      const imagesData = formData.images.map((img) => ({
        url: img.url || null,
        alt: img.alt?.trim() || img.file?.name || "",
      }));
      fd.append("imagesData", JSON.stringify(imagesData));

      const token = localStorage.getItem("userToken");

      await axios.post(`${BASE_URL}/api/testimonials`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert("✅ Testimonial submitted successfully!");
      setFormData({
        name: "",
        email: "",
        rating: 5,
        title: "",
        comment: "",
        images: [],
      });
      navigate("/testimonials");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit testimonial");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Give Us Your Feedback</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Name *</label>
          <input
            required
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your Email (optional)"
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Rating *</label>
          <input
            required
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            placeholder="Rating (1-5)"
            min="1"
            max="5"
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title (optional)"
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Comment *</label>
          <textarea
            required
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Your Feedback"
            rows={4}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Upload Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="border p-2 rounded w-full"
            disabled={uploading}
          />
          <div className="flex gap-3 flex-wrap mt-4">
            {formData.images.map((img, index) => (
              <div
                key={index}
                className="relative group border p-2 rounded w-28 h-28 flex flex-col items-center"
              >
                <img
                  src={img.url || (img.file && URL.createObjectURL(img.file))}
                  alt={img.alt || `Image ${index}`}
                  className="w-20 h-20 object-cover rounded"
                />
                <input
                  type="text"
                  value={img.alt || ""}
                  onChange={(e) => {
                    const newImgs = [...formData.images];
                    newImgs[index].alt = e.target.value;
                    setFormData((prev) => ({ ...prev, images: newImgs }));
                  }}
                  placeholder="Alt text"
                  className="border p-1 mt-1 rounded w-full text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white px-1 rounded"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {uploading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}

export default TestimonialForm;
