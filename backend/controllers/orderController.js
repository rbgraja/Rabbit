const Order = require("../models/orderModel");
const Cart = require("../models/Cart");
const Product = require("../models/products"); // ✅ Import product model
const mongoose = require("mongoose");

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentmethod, totalPrice } = req.body;
    const userId = req.user?.id;

    console.log("📦 Creating order for user:", userId);
    console.log("Order items:", orderItems);

    // 🛑 Validations
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    if (!paymentmethod || typeof paymentmethod !== "string") {
      return res.status(400).json({ message: "Payment method is required" });
    }

    if (!totalPrice || isNaN(totalPrice)) {
      return res.status(400).json({ message: "Total price must be a valid number" });
    }

    // ✅ Check stock and update
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.stock}, requested: ${item.quantity}`,
        });
      }

      // 🔽 Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    // ✅ Create new order
    const newOrder = new Order({
      user: new mongoose.Types.ObjectId(userId),
      orderItems,
      shippingAddress,
      paymentmethod,
      totalPrice,
      isPaid: false,
    });

    const savedOrder = await newOrder.save();

    // 🧹 Delete user's cart after order is placed
    await Cart.deleteOne({ user: userId });

    res.status(201).json({
      success: true,
      message: "Order placed successfully, stock updated, and cart cleared",
      order: savedOrder,
    });
  } catch (error) {
    console.error("❌ Error placing order:", error.message);
    res.status(500).json({ message: "Server error while placing order" });
  }
};

// @desc    Get all orders of the logged-in user
// @route   GET /api/orders/my-order
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id;

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("❌ Error getting user orders:", error.message);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const order = await Order.findById(orderId).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🛑 Only the owner or an admin can access the order
    if (
      order.user._id.toString() !== userId.toString() &&
      userRole !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("❌ Error fetching order by ID:", error.message);
    res.status(500).json({ message: "Server error while retrieving order" });
  }
};
