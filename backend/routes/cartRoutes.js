const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/products");
const { protect } = require("../middleware/auth");

const router = express.Router();

/** 🔢 Calculate total price */
const calculateTotal = (products) => {
  return products.reduce((acc, item) => {
    const price = Number(item.price);
    const qty = Number(item.quantity);
    return acc + (isNaN(price) || isNaN(qty) ? 0 : price * qty);
  }, 0);
};

/** 🧼 Normalize string values for comparison */
const normalize = (value) => value?.trim().toLowerCase();

/** 🔁 Get cart by user or guest ID */
const getCartByUserOrGuestId = async (userId, guestId) => {
  if (userId) return await Cart.findOne({ user: userId });
  if (guestId) return await Cart.findOne({ guestId });
  return null;
};

/**
 * =========================================================================
 * @route   GET /api/cart
 * @desc    Fetch cart by userId or guestId
 * @access  Public
 * =========================================================================
 */
router.get("/", async (req, res) => {
  const guestId = req.query.guestId;
  const userId = req.user?.id || req.query.userId;

  try {
    const cart = await getCartByUserOrGuestId(userId, guestId);
    res.json(cart || { products: [], totalPrice: 0, guestId, user: userId });
  } catch (err) {
    console.error("Get Cart Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * =========================================================================
 * @route   POST /api/cart
 * @desc    Add item to cart or create if not exists
 * @access  Public
 * =========================================================================
 */
router.post("/",  protect, async (req, res) => {
  const { guestId, productId, size, color, quantity } = req.body;
  const userId = req.user?.id || req.query.userId;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await getCartByUserOrGuestId(userId, guestId);
    if (!cart) {
      cart = new Cart({
        user: userId || null,
        guestId: userId ? null : guestId || `guest_${Math.random().toString(36).substr(2, 9)}`,
        products: [],
      });
    }

    const normalizedSize = normalize(size);
    const normalizedColor = normalize(color);
    const qty = Number(quantity);

    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const existingItem = cart.products.find(
      (item) =>
        item.productId.toString() === productId &&
        normalize(item.size) === normalizedSize &&
        normalize(item.color) === normalizedColor
    );

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.products.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0]?.url || "",
        price: product.price,
        size: normalizedSize,
        color: normalizedColor,
        quantity: qty,
      });
    }

    cart.totalPrice = calculateTotal(cart.products);
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error("Add to Cart Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * =========================================================================
 * @route   PUT /api/cart
 * @desc    Update quantity of cart item
 * @access  Public
 * =========================================================================
 */
router.put("/",protect,  async (req, res) => {
  const { guestId, productId, size, color, quantity } = req.body;
  const userId = req.user?.id || req.query.userId;

  try {
    const cart = await getCartByUserOrGuestId(userId, guestId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const normalizedSize = normalize(size);
    const normalizedColor = normalize(color);

    const index = cart.products.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        normalize(item.size) === normalizedSize &&
        normalize(item.color) === normalizedColor
    );

    if (index === -1) return res.status(404).json({ message: "Item not found" });

    const qty = Number(quantity);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    if (qty === 0) {
      cart.products.splice(index, 1);
    } else {
      cart.products[index].quantity = qty;
    }

    cart.totalPrice = calculateTotal(cart.products);
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error("Update Cart Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * =========================================================================
 * @route   DELETE /api/cart
 * @desc    Remove one cart item only
 * @access  Public
 * =========================================================================
 */
router.delete("/",protect, async (req, res) => {
  const { guestId, productId, size, color } = req.body;
  const userId = req.user?.id || req.query.userId;

  try {
    const cart = await getCartByUserOrGuestId(userId, guestId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const normalizedSize = normalize(size);
    const normalizedColor = normalize(color);

    const index = cart.products.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        normalize(item.size) === normalizedSize &&
        normalize(item.color) === normalizedColor
    );

    if (index > -1) {
      cart.products.splice(index, 1);
    }

    cart.totalPrice = calculateTotal(cart.products);
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error("Remove Cart Item Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * @route   POST /api/cart/merge
 * @desc    Merge guest cart into user's cart on login
 * @access  Private
 */
router.post("/merge", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const guestId = req.body.guestId;

    if (!guestId) {
      return res.status(400).json({ message: "guestId is required" });
    }

    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: userId });

    if (!guestCart || guestCart.products.length === 0) {
      return res.status(200).json({ message: "Guest cart is empty or not found" });
    }

    if (!userCart) {
      guestCart.user = userId;
      guestCart.guestId = null;
      guestCart.totalPrice = calculateTotal(guestCart.products); // 🧮 Important!
      await guestCart.save();
      return res.status(200).json({ message: "Cart merged successfully", cart: guestCart });
    }

    // 👇 Merge Logic
    guestCart.products.forEach((guestItem) => {
      const existingItem = userCart.products.find(
        (item) =>
          item.productId.toString() === guestItem.productId.toString() &&
          normalize(item.size) === normalize(guestItem.size) &&
          normalize(item.color) === normalize(guestItem.color)
      );

      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
      } else {
        userCart.products.push(guestItem);
      }
    });

    userCart.totalPrice = calculateTotal(userCart.products); // 🧮 Important!
    await userCart.save();

    // ✅ Delete guest cart
    await Cart.deleteOne({ guestId });

    res.status(200).json({ message: "Cart merged successfully", cart: userCart });
  } catch (error) {
    console.error("Merge Error:", error.message);
    res.status(500).json({ message: "Something went wrong during merge" });
  }
});


/**
 * =========================================================================
 * @route   PUT /api/cart/deduplicate
 * @desc    🧹 Temporary route to clean duplicate cart items
 * @access  Public
 * =========================================================================
 */
router.put("/deduplicate", async (req, res) => {
  const { guestId, userId } = req.body;
  const cart = await getCartByUserOrGuestId(userId, guestId);
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const seen = new Map();

  cart.products.forEach((item) => {
    const key = `${item.productId}_${normalize(item.size)}_${normalize(item.color)}`;
    if (seen.has(key)) {
      seen.get(key).quantity += item.quantity;
    } else {
      seen.set(key, { ...item.toObject() });
    }
  });

  cart.products = Array.from(seen.values());
  cart.totalPrice = calculateTotal(cart.products);
  await cart.save();

  res.status(200).json(cart);
});

module.exports = router;
