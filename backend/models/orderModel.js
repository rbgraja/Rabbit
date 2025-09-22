// 🛠 Import mongoose to define schemas and interact with MongoDB
const mongoose = require("mongoose");

// 📦 Sub-schema for order items
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // 🔗 Reference to Product model
    required: true,
  },
  name: { type: String, required: true }, // 🏷️ Product name
  image: { type: String, required: true }, // 🖼️ Product image URL
  price: { type: Number, required: true }, // 💵 Price at the time of order
  quantity: { type: Number, required: true }, // 🔢 Ordered quantity
  size: { type: String }, // 📏 Optional: Size (if applicable)
   color: {
    name: { type: String, required: true, trim: true },
    hex: { type: String, default: "#ccc" },
  }, // 🎨 Optional: Color (if applicable)
});

// 📦 Main order schema
const orderSchema = new mongoose.Schema(
  {
    // 👤 Reference to user who placed the order
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📦 List of ordered items
    orderItems: [orderItemSchema],

    // 📍 Shipping information
    shippingAddress: {
      firstname: { type: String, required: true },
      lastname: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalcode: { type: String, required: true }, // match frontend
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },

    // 💳 Payment and pricing details
    paymentmethod: { type: String, required: true },
    totalPrice: { type: Number, required: true },

    // ✅ Payment status
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
    paymentStatus: { type: String, default: "pending" }, // e.g., pending, completed, failed
    paymentdetails: { type: Object, default: {} }, // gateway response details

    // 🚚 Order processing status
    isFinalized: { type: Boolean, default: false },
    orderStatus: {
      type: String,
      enum: ["Processing", "On the way", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
  },
  { timestamps: true } // 🕒 Adds createdAt and updatedAt
);

// 📤 Export the model
module.exports = mongoose.model("Order", orderSchema);
