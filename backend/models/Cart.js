const mongoose = require("mongoose");

// 🛒 Single item in the cart
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  size: {
    type: String,
    required: true,
  },
  color: {
      hex: {
      type: String,
      default: "#ccc",
    },
    name: {
      type: String,
      required: false,
      trim: true,
    },
  
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

// 🛍️ Entire cart (for a user or guest)
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    guestId: {
      type: String,
      default: null,
    },
    products: {
      type: [cartItemSchema],
      default: [],
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// 📦 Export the model
module.exports = mongoose.model("Cart", cartSchema);
