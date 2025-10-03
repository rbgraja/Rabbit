const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/auth");
const multer = require("multer");

// 🟢 Memory storage (buffer based for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  createTestimonial,
  getTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  approveTestimonial,
} = require("../controllers/testimonialController");

// 🔹 Public routes
router.get("/", getTestimonials);
router.get("/:id", getTestimonialById);

// 🔹 User routes
// agar tum chaho ke guest bhi testimonial de sake → `protect` hata do
router.post("/", protect, upload.array("images", 5), createTestimonial);

// 🔹 Update testimonial (owner or admin)
router.put("/:id", protect, upload.array("images", 5), updateTestimonial);

// 🔹 Admin only
router.delete("/:id", protect, authorizeRoles("admin"), deleteTestimonial);
router.put("/:id/approve", protect, authorizeRoles("admin"), approveTestimonial);

module.exports = router;
