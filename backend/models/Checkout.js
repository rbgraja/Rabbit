const mongoose = require("mongoose");

// Subdocument schema for checkout items
const checkoutItemSchema = new mongoose.Schema({
  productsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
  },
}, {
  _id: false
});

// Main Checkout schema
const checkoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  checkoutitems: [checkoutItemSchema],
  shippingaddress: {
    address: { type: String, required: true },
    city: { type: String, required: true }, // ✅ Fixed "cite" typo
    postalcode: { type: String, required: true },
    country: { type: String, required: true },
  },
  paymentmethod: {
    type: String,
    required: false,
     default: "N/A"
  },
  totalprice: {
    type: Number,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidat: {
    type: Date,
  },
  paymentStatus: {
    type: String,
    default: "pending",
  },
  paymentdetails: {
    type: mongoose.Schema.Types.Mixed,
  },
  isFinalized: {
    type: Boolean,
    default: false,
  },
  finalizedAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("Checkout", checkoutSchema);
