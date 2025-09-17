// 📦 Import necessary modules
const express = require("express"); // Express framework for routing
const jwt = require("jsonwebtoken"); // For generating and verifying JWT tokens
const bcrypt = require("bcryptjs"); // For shing and comparing passwords
const User = require("../models/User"); // Mongoose User model schema
const { protect, authorizeRoles } = require("../middleware/auth"); // Custom middleware to protect routes

// 🔧 Create a new router instance
const router = express.Router();

/**
 * ==========================================================
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public (no token required)
 * ==========================================================
 */
router.post("/register", async (req, res) => {
  // 🧾 Extract name, email, and password from request body
  const { name, email, password } = req.body;

  try {
    // 🔍 Step 1: Check if a user already exists with the same email
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" }); // Conflict
    }

    // 🛠 Step 2: Create new User instance
    user = new User({ name, email, password }); // Password will be hashed by model's middleware

    // 💾 Step 3: Save user to database
    await user.save();

    // 📦 Step 4: Create JWT payload
    const payload = {
      user: {
        id: user._id, // Store only ID and role in token for security
        role: user.role,
      },
    };

    // 🔐 Step 5: Sign JWT token using secret key
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "40h" }, (err, token) => {
      if (err) throw err;

      // 📤 Send token and user info in response (excluding password)
      res.status(201).json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token, // JWT token to be stored in frontend (localStorage or cookie)
      });
    });
  } catch (error) {
    console.error("Registration Error:", error); // Log error to server console
    res.status(500).send("Server error"); // Internal Server Error
  }
});

/**
 * ==========================================================
 * @route   POST /api/users/login
 * @desc    Login user and return JWT token
 * @access  Public
 * ==========================================================
 */
router.post("/login", async (req, res) => {
  // 🧾 Extract email and password from request body
  const { email, password } = req.body;

  try {
    // 🔍 Step 1: Find user in DB by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" }); // User not found
    }

    // 🔐 Step 2: Match entered password with stored hashed password
    const isMatch = await user.matchPassword(password); // Calls method in User model
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 📦 Step 3: Create JWT payload
    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    // 🔐 Step 4: Sign and return token
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "40h" }, (err, token) => {
      if (err) throw err;

      // 📤 Send token and user info
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send("Server error");
  }
});

/**
 * ==========================================================
 * @route   GET /api/users/profile
 * @desc    Get logged-in user's profile
 * @access  Private (requires token)
 * ==========================================================
 */
router.get("/profile", protect, async (req, res) => {
  try {
    // 🧾 Get user by ID (ID extracted from decoded token in middleware)
    const user = await User.findById(req.user.id).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 📤 Send user profile
    res.json(user);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).send("Server error");
  }
});

/**
 * ==========================================================
 * @route   GET /api/users/profile/:id
 * @desc    Get profile by user ID
 * @access  Public (can make private later)
 * ==========================================================
 */
router.get("/profile/:id", async (req, res) => {
  try {
    // 🔍 Find user by ID passed in URL
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Profile By ID Error:", error);
    res.status(500).send("Server error");
  }
});

/**
 * ==========================================================
 * @route   PUT /api/users/update/:id
 * @desc    Update user's name/email
 * @access  Private (only owner or admin)
 * ==========================================================
 */
router.put("/update/:id", protect, async (req, res) => {
  try {
    // 🛡️ Only allow if user is owner or admin
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 📝 Get updated fields from body
    const { name, email } = req.body;

    // 🔄 Update user and return new data
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true } // return updated document
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).send("Server error");
  }
});

/**
 * ==========================================================
 * @route   DELETE /api/users/delete/:id
 * @desc    Delete user account
 * @access  Private (only owner or admin)
 * ==========================================================
 */
router.delete("/delete/:id", protect, async (req, res) => {
  try {
    // 🛡️ Check if user is same as the one deleting OR an admin
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete" });
    }

    // ❌ Delete the user
    await User.findByIdAndDelete(req.params.id);

    // ✅ Respond with success message
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).send("Server error");
  }
});

// 📤 Export router to use in main server file
module.exports = router;
