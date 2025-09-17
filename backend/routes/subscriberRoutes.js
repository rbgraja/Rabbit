const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");
const { protect , authorizeRoles } = require("../middleware/auth");


// @route   POST /api/subscribers
// @desc    Add a new subscriber
// @access  Public
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check for duplicate email
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Already subscribed with this email" });
    }

    const subscriber = await Subscriber.create({ email });

    res.status(201).json({
      success: true,
      message: "Successfully subscribed",
      subscriber,
    });
  } catch (err) {
    console.error("Subscribe error:", err.message);
    res.status(500).json({ message: "Server error while subscribing" });
  }
});

// @route   GET /api/subscribers
// @desc    Get all subscribers
// @access  Private/Admin
router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ subscriberat: -1 });
    res.status(200).json({ success: true, count: subscribers.length, subscribers });
  } catch (err) {
    console.error("Fetch subscribers error:", err.message);
    res.status(500).json({ message: "Failed to fetch subscribers" });
  }
});

// @route   DELETE /api/subscribers/:id
// @desc    Delete a subscriber by ID
// @access  Private/Admin
router.delete("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found" });
    }

    res.status(200).json({ success: true, message: "Subscriber deleted" });
  } catch (err) {
    console.error("Delete subscriber error:", err.message);
    res.status(500).json({ message: "Failed to delete subscriber" });
  }
});

module.exports = router;
