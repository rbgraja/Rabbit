const Testimonial = require("../models/Testimonial");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");

/** 🔄 Helper: Upload single file buffer to Cloudinary */
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "testimonials",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary upload error:", error);
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

/** ✅ Create testimonial */
const createTestimonial = async (req, res) => {
  try {
    const { name, email, rating, title, comment, product } = req.body;

    if (!name || !rating || !comment) {
      return res
        .status(400)
        .json({ success: false, message: "Name, rating and comment are required." });
    }

    // ✅ Upload images to Cloudinary
    const uploadedImages = await Promise.all(
      (req.files || []).map((file) => uploadToCloudinary(file))
    );

    const testimonial = new Testimonial({
      user: req.user ? req.user._id : null,
      name,
      email,
      rating,
      title,
      comment,
      product,
      approved: req.user && req.user.isAdmin ? true : false,
      visible: true,
      images: uploadedImages,
    });

    await testimonial.save();
    return res.status(201).json({ success: true, data: testimonial });
  } catch (err) {
    console.error("❌ createTestimonial error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** ✅ Get testimonials (public vs admin) */
const getTestimonials = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let filter = {};

    // Non-admin → only visible + approved
    if (!req.user || !req.user.isAdmin) {
      filter = { visible: true, approved: true };
    }

    // Admin filters
    if (req.user && req.user.isAdmin) {
      if (req.query.approved !== undefined)
        filter.approved = req.query.approved === "true";
      if (req.query.visible !== undefined)
        filter.visible = req.query.visible === "true";
      if (req.query.product) filter.product = req.query.product;
      if (req.query.minRating)
        filter.rating = { $gte: Number(req.query.minRating) };
    }

    const total = await Testimonial.countDocuments(filter);
    const testimonials = await Testimonial.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      data: testimonials,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error("❌ getTestimonials error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** ✅ Get single testimonial */
const getTestimonialById = async (req, res) => {
  try {
    const t = await Testimonial.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!t) return res.status(404).json({ success: false, message: "Testimonial not found" });
    return res.json({ success: true, data: t });
  } catch (err) {
    console.error("❌ getTestimonialById error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** ✅ Update testimonial */
const updateTestimonial = async (req, res) => {
  try {
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: "Testimonial not found" });

    // Check if owner or admin
    if (
      t.user &&
      req.user &&
      t.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ success: false, message: "Not authorized to update" });
    }

    // Upload new images if any
    const uploadedImages = await Promise.all(
      (req.files || []).map((file) => uploadToCloudinary(file))
    );

    if (uploadedImages.length > 0) {
      t.images = [...t.images, ...uploadedImages]; // append new images
    }

    const allowed = ["name", "email", "rating", "title", "comment", "visible", "approved"];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) t[k] = req.body[k];
    });

    await t.save();
    return res.json({ success: true, data: t });
  } catch (err) {
    console.error("❌ updateTestimonial error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** ✅ Soft-delete testimonial (admin only) */
const deleteTestimonial = async (req, res) => {
  try {
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: "Testimonial not found" });

    t.visible = false;
    await t.save();

    return res.json({ success: true, message: "Testimonial hidden", data: t });
  } catch (err) {
    console.error("❌ deleteTestimonial error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** ✅ Approve / Unapprove testimonial */
const approveTestimonial = async (req, res) => {
  try {
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: "Testimonial not found" });

    t.approved = req.body.isApproved ?? true;
    await t.save();
    return res.json({ success: true, data: t });
  } catch (err) {
    console.error("❌ approveTestimonial error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createTestimonial,
  getTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  approveTestimonial,
};
