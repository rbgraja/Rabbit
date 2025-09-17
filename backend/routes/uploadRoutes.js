// Import required modules
const express = require("express");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;
const { protect } = require("../middleware/auth");
require("dotenv").config(); // Load environment variables

// 🔧 Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Express router
const router = express.Router();

// 📸 Set up multer to store incoming file in memory (not on disk)
const storage = multer.memoryStorage();
const upload = multer({ storage }); // Handles multipart/form-data

// @route   POST /api/upload
// @desc    Upload a single image to Cloudinary
// @access  Private (JWT-protected route)
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    // 🔍 Validate that an image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    // 📤 Function to upload buffer to Cloudinary via stream
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        // Create Cloudinary upload stream
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "uploads", // Optional: save in a specific Cloudinary folder
            resource_type: "image", // Only allow images
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );

        // Pipe the in-memory file buffer into Cloudinary stream
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    // ⏳ Await the result of the upload
    const result = await streamUpload(req.file.buffer);

    // ✅ Respond with Cloudinary URL and public_id
    res.status(200).json({
      success: true,
      url: result.secure_url,     // Image URL to store/use
      public_id: result.public_id // ID to reference/delete later
    });

  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    res.status(500).json({ message: "Image upload failed" });
  }
});

// Export the router
module.exports = router;
