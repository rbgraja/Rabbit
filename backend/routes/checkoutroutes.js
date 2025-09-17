const express = require("express");
const router = express.Router();
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Product = require("../models/products");
const Order = require("../models/Order");
const { protect, authorizeRoles } = require("../middleware/auth");
const mongoose = require("mongoose");

// 🧮 Utility: Calculate total price
const calculateTotal = (items) => {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
};

// @route   POST /api/checkout
// @desc    Checkout and create order
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId });

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const shippingaddress = req.body.shippingaddress;
    const paymentmethod = req.body.paymentmethod || "Cash on Delivery";
    const isCOD = paymentmethod === "Cash on Delivery";

    // Prepare checkout and order items
    const rawItems = await Promise.all(
      cart.products.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        return {
          productId: product._id, // for Order
          productsId: product._id, // for Checkout
          name: product.name,
          image: product.images?.[0]?.url || "",
          price: product.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        };
      })
    );

    const checkoutItems = rawItems.map((item) => ({
      productsId: item.productsId,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    }));

    const orderItems = rawItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));

    const totalprice = calculateTotal(checkoutItems);

    // Create Checkout
    const checkout = new Checkout({
      user: userId,
      checkoutitems: checkoutItems,
      shippingaddress,
      paymentmethod,
      totalprice,
      isPaid: !isCOD,
      paidat: isCOD ? null : new Date(),
      paymentStatus: isCOD ? "Pending" : "Paid",
      paymentdetails: req.body.paymentdetails || {},
    });
    await checkout.save();

    // Create Order
    const order = await Order.create({
      user: new mongoose.Types.ObjectId(userId),
      orderItems,
      totalPrice: totalprice,
      paymentStatus: isCOD ? "Pending" : "Paid",
      orderStatus: "Processing",
      shippingAddress: shippingaddress,
      paymentmethod,
    });
    // await order.save();

    // Clear cart
    cart.products = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({
      message: "Checkout successful",
      checkout,
      order,
    });
  } catch (err) {
    console.error("Checkout Error:", err.message);
    res.status(500).json({ message: err.message || "Server Error" });
  }
});

/**
 * =========================================================================
 * @route   PUT /api/checkout/:id/pay
 * @desc    Mark checkout as paid
 * @access  Private
 * =========================================================================
 */
router.put("/:id/pay", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) return res.status(404).json({ message: "Checkout not found" });

    if (checkout.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    checkout.isPaid = true;
    checkout.paidat = new Date();
    checkout.paymentStatus = "Paid";
    checkout.paymentdetails = req.body.paymentdetails || {}; // 🔥 Here was the error

    await checkout.save();
    res.status(200).json({ message: "Payment confirmed", checkout });
  } catch (err) {
    console.error("PAYMENT ERROR:", err); // ✅ Now logs full error
    res.status(500).json({ message: err.message || "Server Error" });
  }
});


/**
 * =========================================================================
 * @route   GET /api/checkout/mine
 * @desc    Get all checkouts of logged-in user
 * @access  Private
 * =========================================================================
 */
router.get("/mine", protect, async (req, res) => {
  try {
    const checkouts = await Checkout.find({ user: req.user.id });
    res.status(200).json(checkouts);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * =========================================================================
 * @route   GET /api/checkout/:id
 * @desc    Get single checkout by ID (admin or owner)
 * @access  Private
 * =========================================================================
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id).populate("user", "name email");
    if (!checkout) return res.status(404).json({ message: "Checkout not found" });

    const isOwner = checkout.user._id.toString() === req.user.id;
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(checkout);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * =========================================================================
 * @route   GET /api/checkout
 * @desc    Admin: Get all checkouts
 * @access  Private/Admin
 * =========================================================================
 */
router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const checkouts = await Checkout.find().populate("user", "name email");
    res.status(200).json(checkouts);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * =========================================================================
 * @route   PUT /api/checkout/:id/finalize
 * @desc    Admin: Finalize a checkout
 * @access  Private/Admin
 * =========================================================================
 */
router.put("/:id/finalize", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) return res.status(404).json({ message: "Checkout not found" });

    checkout.isFinalized = true;
    checkout.finalizedAt = new Date();
    await checkout.save();2

    res.status(200).json({ message: "Checkout finalized", checkout });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});


module.exports = router;
