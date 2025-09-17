const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/auth");  // <-- authorizeRoles import yahan karo
const {
  createOrder,
  getMyOrders,
  getOrderById,

} = require("../controllers/orderController");

// @route   POST /api/orders
// @desc    Create new order
// @access  Private 
router.post("/", protect, createOrder);

// @route   GET /api/orders/my-order
// @desc    Get all orders of the logged-in user
// @access  Private
router.get("/my-order", protect, getMyOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get("/:id", protect, getOrderById);



module.exports = router;
