const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");
const { protect } = require("../middleware/auth");

router.post("/", protect, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentmethod,
      totalPrice,
    } = req.body;

    // Debug logs to track down 500 error
    console.log("🧾 Incoming order data:", {
      user: req.user?.id,
      orderItems,
      shippingAddress,
      paymentmethod,
      totalPrice,
    });

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({ message: "Invalid total price" });
    }

    // Temporary patch: fallback hardcoded user ID for testing
    const userId = req.user?.id || "64xxxxxxxxxxxxxxxxxxxxxxxx"; // Replace with a real ObjectId from your DB

    const newOrder = new Order({
      user: userId,
      orderItems,
      shippingAddress,
      paymentmethod: paymentmethod || "N/A", // Optional default
      totalPrice,
      isPaid: false,
      paidAt: null,
      paymentStatus: "pending",
      paymentdetails: {},
      isFinalized: false,
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("❌ Error placing order:", {
      message: error.message,
      stack: error.stack,
      error,
    });

    res.status(500).json({
      message: "Server error while placing order",
      details: error.message,
    });
  }
});

module.exports = router;
