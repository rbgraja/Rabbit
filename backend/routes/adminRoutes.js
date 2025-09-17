const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/orderModel");
const Product = require("../models/products");
const Subscriber = require("../models/Subscriber");
const { protect, authorizeRoles } = require("../middleware/auth");

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
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
       console.log("📦 Admin Orders from DB:", orders); // Debug
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
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
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

router.post("/products", protect, authorizeRoles("admin"), async (req, res) => {
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
      color, // in case frontend sends `color`
      collection,
      material,
      gender,
      images,
      isFeatured,
      isActive,
      isPublished,
      category,
    } = req.body;

    if (!name || price === undefined || !stock || !collection || !category) {
      console.error("❌ Missing required fields:", req.body);
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Normalize colors
    const normalizedColors = Array.isArray(colors)
      ? colors
      : Array.isArray(color)
      ? color
      : [];

    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      sku,
      brand,
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: normalizedColors,
      collection,
      material,
      gender: ["Men", "Women", "Unisex"].includes(gender) ? gender : "Unisex",
      images: Array.isArray(images) ? images.map((img) => ({ url: img.url, alt: img.alt || "" })) : [],
      isFeatured: !!isFeatured,
      isActive: isActive !== undefined ? isActive : true,
      isPublished: isPublished !== undefined ? isPublished : false,
      category,
      createdBy: req.user?._id,
    });

    await newProduct.save();
    console.log("✅ Product created:", newProduct._id);

    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    console.error("❌ Failed to create product:", err);
    res.status(500).json({ message: "Failed to create product", error: err.message });
  }
});


router.put("/products/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const updates = req.body;
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    Object.assign(product, updates);
    await product.save();

    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product" });
  }
});

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
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    console.log("Stats fetched from DB:", { totalOrders, totalProducts, totalRevenue });

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

module.exports = router;
