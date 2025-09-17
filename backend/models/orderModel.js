// models/orderModel.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // or whatever your product model is named
    required: true,
  },
  name: String,
  image: String,
  price: Number,
  quantity: Number,
  size: String,
  color: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [orderItemSchema],
  shippingAddress: {
  firstname: String,
  lastname: String,
  address: String,
  city: String,
  postalcode: String, // match frontend
  country: String,
  phone: String,
},

    paymentmethod: String,
    totalPrice: Number,
    isPaid: Boolean,
    paidAt: Date,
    paymentStatus: String,
    paymentdetails: Object,
    isFinalized: Boolean,

       orderStatus: {
      type: String,
      enum: ["Processing", "On the way", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",  // default value
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
