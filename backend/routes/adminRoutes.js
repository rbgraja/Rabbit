const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/orderModel");
const Product = require("../models/products");
const Testimonial = require("../models/Testimonial");
const Subscriber = require("../models/Subscriber");
const { protect, authorizeRoles } = require("../middleware/auth");
const cloudinary = require("../utils/cloudinary");
const multer = require("multer");
const streamifier = require("streamifier");

/* ------------------------ Multer Setup ------------------------ */
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ------------------------ Users ------------------------ */

router.get("/users", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.post("/users", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email" });
    }
    const newUser = await User.create({ name, email, password, role: role || "customer" });
    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Failed to create user", error: err.message });
  }
});

router.put("/users/:id/role", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "customer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.role = role;
    await user.save();
    res.status(200).json({ success: true, message: "User role updated", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user role", error: err.message });
  }
});

router.delete("/users/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

/* ------------------------ Orders ------------------------ */
router.get("/orders", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    console.log("📦 Orders fetched from DB:", orders.length);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

router.put("/orders/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Processing", "Shipped", "On the way", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    order.orderStatus = status;
    await order.save();
    res.status(200).json({ success: true, message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
});

router.delete("/orders/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    await order.deleteOne();
    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete order" });
  }
});

// Update payment status of order
router.put("/orders/:id/payment", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const orderId = req.params.id;
    const { isPaid } = req.body;

    if (typeof isPaid !== "boolean") {
      return res.status(400).json({ message: "Invalid isPaid value" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.isPaid = isPaid;
    if (isPaid) {
      order.paidAt = new Date();
      order.paymentStatus = "Paid";
    } else {
      order.paidAt = null;
      order.paymentStatus = "Unpaid";
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Error updating payment status:", error.message);
    res.status(500).json({ message: "Server error while updating payment status" });
  }
});

/* ------------------------ Products ------------------------ */
router.get("/products", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

router.get("/products/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

// Upload single/multiple images route (Cloudinary via backend)
router.post("/upload", protect, authorizeRoles("admin"), upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const streamUpload = (reqFile) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(reqFile.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file);
    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: "Image upload failed", error: err.message });
  }
});

// Create product
router.post(
  "/products",
  protect,
  authorizeRoles("admin"),
  upload.array("images"),
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        stock,
        sku,
        brand,
        sizes,
        colors,
        collection,
        material,
        gender,
        isFeatured,
        isActive,
        isPublished,
        category,
        imagesData,
        discount, // ✅ added
      } = req.body;

      const sizesArray = sizes ? JSON.parse(sizes) : [];
      const colorsArray = colors ? JSON.parse(colors) : [];
      const imagesArray = imagesData ? JSON.parse(imagesData) : [];

      // Upload new files
      const uploadedImages = await Promise.all(
        (req.files || []).map((file, i) => {
          const altText = imagesArray[i]?.alt?.trim() || file.originalname;
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "products" },
              (err, result) => {
                if (err) reject(err);
                else resolve({ url: result.secure_url, alt: altText });
              }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
          });
        })
      );

      const finalImages = uploadedImages;

      const product = await Product.create({
        name,
        description,
        price: Number(price), // ✅ force number
        stock: Number(stock),
        discount: Number(discount) || 0, // ✅ force number
        sku,
        brand,
        sizes: sizesArray,
        colors: colorsArray,
        collection,
        material,
        gender,
        isFeatured,
        isActive,
        isPublished,
        category,
        images: finalImages,
      });

      res.status(201).json({ success: true, product });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Server error", error: err.message });
    }
  }
);

// Update product
router.put(
  "/products/:id",
  protect,
  authorizeRoles("admin"),
  upload.array("images"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });

      const {
        name,
        description,
        price,
        stock,
        sku,
        brand,
        sizes,
        colors,
        collection,
        material,
        gender,
        isFeatured,
        isActive,
        isPublished,
        category,
        rating,
        imagesData,
        discount, // ✅ added
      } = req.body;

      const sizesArray = sizes ? JSON.parse(sizes) : [];
      const colorsArray = colors ? JSON.parse(colors) : [];
      const imagesArray = imagesData ? JSON.parse(imagesData) : [];

      // Upload new files
      const uploadedImages = await Promise.all(
        (req.files || []).map((file, i) => {
          const altText =
            imagesArray.find((img) => !img.url)?.alt || file.originalname;
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "products" },
              (err, result) => {
                if (err) reject(err);
                else resolve({ url: result.secure_url, alt: altText });
              }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
          });
        })
      );

      const finalImages = [
        ...imagesArray.filter((img) => img.url),
        ...uploadedImages,
      ];

      Object.assign(product, {
        name,
        description,
        price: Number(price), // ✅ force number
        stock: Number(stock),
        discount: Number(discount) || 0, // ✅ force number
        sku,
        brand,
        sizes: sizesArray,
        colors: colorsArray,
        collection,
        material,
        gender,
        isFeatured,
        isActive,
        isPublished,
        category,
        rating,
        images: finalImages,
      });

      await product.save();
      res.json({ success: true, product });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Server error", error: err.message });
    }
  }
);



router.delete("/products/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product" });
  }
});


/* ------------------------ Subscribers ------------------------ */

router.get("/subscribers", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const subs = await Subscriber.find().sort({ subscriberat: -1 });
    res.status(200).json({ success: true, count: subs.length, subscribers: subs });
  } catch (err) {
    res.status(500).json({ message: "Error fetching subscribers" });
  }
});

router.delete("/subscribers/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const deleted = await Subscriber.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Subscriber not found" });
    res.status(200).json({ message: "Subscriber deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting subscriber" });
  }
});

/* ------------------------ Stats ------------------------ */

router.get("/stats", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    const revenueAgg = await Order.aggregate([
      {
        $addFields: {
          totalPriceNum: { $toDouble: { $ifNull: ["$totalPrice", 0] } },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalPriceNum" } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.status(200).json({ totalRevenue, totalOrders, totalProducts });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

/* ------------------------ Recent Orders ------------------------ */

router.get("/recent-orders", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(limit);

    console.log("Recent orders fetched from DB:", recentOrders);

    res.status(200).json(recentOrders);
  } catch (err) {
    console.error("Error fetching recent orders:", err);
    res.status(500).json({ message: "Error fetching recent orders" });
  }
});
/* ------------------------ Get All Testimonials ------------------------ */
router.get("/testimonials", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { approved, visible, flagged } = req.query;

    let filter = {};
    if (approved !== undefined) filter.approved = approved === "true";
    if (visible !== undefined) filter.visible = visible === "true";
    if (flagged !== undefined) filter.flagged = flagged === "true";

    const testimonials = await Testimonial.find(filter)
      .populate("user", "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: testimonials.length, testimonials });
  } catch (err) {
    console.error("❌ Error fetching testimonials:", err);
    res.status(500).json({ message: "Error fetching testimonials" });
  }
});

/* ------------------------ Create Testimonial ------------------------ */
router.post(
  "/testimonials",
  protect,
  authorizeRoles("admin"),
  upload.array("images"),
  async (req, res) => {
    try {
      const { name, email, rating, title, comment, product, approved, visible } = req.body;

      if (!name || !rating || !comment) {
        return res.status(400).json({ message: "Name, rating and comment are required" });
      }

      // Upload images if provided
      const uploadedImages = await Promise.all(
        (req.files || []).map((file) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "testimonials" },
              (err, result) => {
                if (err) reject(err);
                else resolve({ url: result.secure_url, public_id: result.public_id });
              }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
          });
        })
      );

      const testimonial = await Testimonial.create({
        name,
        email,
        rating,
        title,
        comment,
        product: product || null,
        approved: approved ?? true,
        visible: visible ?? true,
        images: uploadedImages,
      });

      res.status(201).json({ success: true, testimonial });
    } catch (err) {
      console.error("❌ Error creating testimonial:", err);
      res.status(500).json({ message: "Error creating testimonial" });
    }
  }
);

/* ------------------------ Update Testimonial ------------------------ */
router.put(
  "/testimonials/:id",
  protect,
  authorizeRoles("admin"),
  upload.array("images"),
  async (req, res) => {
    try {
      const testimonial = await Testimonial.findById(req.params.id);
      if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });

      const { name, email, rating, title, comment, approved, visible, flagged } = req.body;

      // Upload new images if any
      const uploadedImages = await Promise.all(
        (req.files || []).map((file) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "testimonials" },
              (err, result) => {
                if (err) reject(err);
                else resolve({ url: result.secure_url, public_id: result.public_id });
              }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
          });
        })
      );

      // Keep old images + add new ones
      testimonial.images = [...testimonial.images, ...uploadedImages];

      Object.assign(testimonial, {
        name: name ?? testimonial.name,
        email: email ?? testimonial.email,
        rating: rating ?? testimonial.rating,
        title: title ?? testimonial.title,
        comment: comment ?? testimonial.comment,
        approved: approved ?? testimonial.approved,
        visible: visible ?? testimonial.visible,
        flagged: flagged ?? testimonial.flagged,
      });

      await testimonial.save();
      res.status(200).json({ success: true, testimonial });
    } catch (err) {
      console.error("❌ Error updating testimonial:", err);
      res.status(500).json({ message: "Error updating testimonial" });
    }
  }
);

/* ------------------------ Delete Testimonial ------------------------ */
router.delete("/testimonials/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });

    // Delete images from cloudinary also
    await Promise.all(
      testimonial.images.map((img) => cloudinary.uploader.destroy(img.public_id))
    );

    await testimonial.deleteOne();
    res.status(200).json({ success: true, message: "Testimonial deleted" });
  } catch (err) {
    console.error("❌ Error deleting testimonial:", err);
    res.status(500).json({ message: "Error deleting testimonial" });
  }
});

module.exports = router;
