const Order = require("../models/orderModel");
const Cart = require("../models/Cart");
const Product = require("../models/products");
const mongoose = require("mongoose");

/** 🧮 Helper: get discounted price */
const getDiscountedPrice = (product) => {
  if (!product) return 0;
  const discount = product.discount || 0;
  const price = product.price || 0;
  return discount > 0 ? Math.round(price - (price * discount) / 100) : price;
};

/** 🔢 Calculate total order price */
const calculateTotal = (items) =>
  items.reduce(
    (acc, item) => acc + (Number(item.price) * Number(item.quantity) || 0),
    0
  );

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentmethod } = req.body;
    const userId = req.user?.id;

    console.log("📦 Creating order for user:", userId);

    // 🛑 Validations
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res
        .status(400)
        .json({ message: "Order items are required" });
    }

    if (!shippingAddress) {
      return res
        .status(400)
        .json({ message: "Shipping address is required" });
    }

    if (!paymentmethod || typeof paymentmethod !== "string") {
      return res
        .status(400)
        .json({ message: "Payment method is required" });
    }

    /** ✅ Re-validate prices from DB */
    let validatedItems = [];
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.stock}, requested: ${item.quantity}`,
        });
      }

      // discounted price
      const discountedPrice = getDiscountedPrice(product);

      validatedItems.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0]?.url || "",
        price: discountedPrice,
        size: item.size || "default",
        color: item.color || { name: "Default", hex: "#ccc" },
        quantity: item.quantity,
      });

      // 🔽 Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    // ✅ Calculate final total
    const totalPrice = calculateTotal(validatedItems);

    // ✅ Create new order
    const newOrder = new Order({
      user: new mongoose.Types.ObjectId(userId),
      orderItems: validatedItems,
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
      message:
        "Order placed successfully, stock updated, and cart cleared",
      order: savedOrder,
    });
  } catch (error) {
    console.error("❌ Error placing order:", error.message);
    res
      .status(500)
      .json({ message: "Server error while placing order" });
  }
};

// @desc    Get all orders of the logged-in user
// @route   GET /api/orders/my-order
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id;

    const orders = await Order.find({ user: userId }).sort({
      createdAt: -1,
    });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this user" });
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("❌ Error getting user orders:", error.message);
    res
      .status(500)
      .json({ message: "Server error while fetching orders" });
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

    const order = await Order.findById(orderId).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🛑 Only the owner or an admin can access the order
    if (
      order.user._id.toString() !== userId.toString() &&
      userRole !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("❌ Error fetching order by ID:", error.message);
    res
      .status(500)
      .json({ message: "Server error while retrieving order" });
  }
};
