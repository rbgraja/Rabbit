const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/products");
const { protect } = require("../middleware/auth");

const router = express.Router();

/** 🧮 Helper: calculate discounted price */
const getDiscountedPrice = (product) => {
  if (!product) return 0;
  const discount = product.discount || 0;
  const price = product.price || 0;
  return discount > 0 ? Math.round(price - (price * discount) / 100) : price;
};

/** 🔢 Calculate total cart price */
const calculateTotal = (products) =>
  products.reduce(
    (acc, item) => acc + (Number(item.price) * Number(item.quantity) || 0),
    0
  );

const normalize = (value) => value?.trim().toLowerCase();
const normalizeColor = (color) => {
  if (!color) return "";
  if (typeof color === "string") return color.trim().toLowerCase();
  if (typeof color === "object" && color.name)
    return color.name.trim().toLowerCase();
  return "";
};

const getCartByUserOrGuestId = async (userId, guestId) => {
  if (userId) return await Cart.findOne({ user: userId });
  if (guestId) return await Cart.findOne({ guestId });
  return null;
};

/** 📦 GET cart */
router.get("/",protect, async (req, res) => {
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

/** ➕ POST cart (add item) */
router.post("/", protect, async (req, res) => {
  const { guestId, productId, size, color, quantity } = req.body;
  const userId = req.user?.id || req.query.userId;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await getCartByUserOrGuestId(userId, guestId);
    if (!cart)
      cart = new Cart({
        user: userId || null,
        guestId: userId
          ? null
          : guestId || `guest_${Math.random().toString(36).substr(2, 9)}`,
        products: [],
      });

    const normalizedSize = size?.trim().toLowerCase() || "default";
    let safeColor = { name: "Default", hex: "#ccc" };
    if (color) {
      if (typeof color === "string") safeColor.name = color.trim() || "Default";
      else if (typeof color === "object") {
        safeColor.name = color.name?.trim() || "Default";
        safeColor.hex = color.hex || "#ccc";
      }
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0)
      return res.status(400).json({ message: "Invalid quantity" });

    const discountedPrice = getDiscountedPrice(product);

    const existingItem = cart.products.find(
      (item) =>
        item.productId.toString() === productId &&
        item.size?.trim().toLowerCase() === normalizedSize &&
        item.color?.name?.trim() === safeColor.name
    );

    if (existingItem) existingItem.quantity += qty;
    else
      cart.products.push({
        productId: product._id,
        name: product.name,
        image: req.body.image || product.images?.[0]?.url || "",
        price: discountedPrice, // ✅ discounted price
        size: normalizedSize,
        color: safeColor,
        quantity: qty,
      });

    cart.totalPrice = calculateTotal(cart.products);
    await cart.save();

    res.status(200).json(cart);
  } catch (err) {
    console.error("Add to Cart Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

/** ✏️ PUT cart (update quantity) */
router.put("/", protect, async (req, res) => {
  const { guestId, productId, size, color, quantity } = req.body;
  const userId = req.user?.id || req.query.userId;
  try {
    const cart = await getCartByUserOrGuestId(userId, guestId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const index = cart.products.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        normalize(item.size) === normalize(size) &&
        normalizeColor(item.color) === normalizeColor(color)
    );

    if (index === -1) return res.status(404).json({ message: "Item not found" });

    const qty = Number(quantity);
    if (isNaN(qty) || qty < 0) return res.status(400).json({ message: "Invalid quantity" });

    if (qty === 0) {
      cart.products.splice(index, 1);
    } else {
      // ✅ re-check discount price
      const product = await Product.findById(productId);
      const discountedPrice = getDiscountedPrice(product);
      cart.products[index].price = discountedPrice;
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


/** ❌ DELETE cart (remove item) */
router.delete("/", protect, async (req, res) => {
  const { guestId, productId, size, color } = req.body;
  const userId = req.user?.id || req.query.userId;
  try {
    const cart = await getCartByUserOrGuestId(userId, guestId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const index = cart.products.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        normalize(item.size) === normalize(size) &&
        normalizeColor(item.color) === normalizeColor(color)
    );

    if (index > -1) cart.products.splice(index, 1);
    cart.totalPrice = calculateTotal(cart.products);
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error("Remove Cart Item Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

/** 🔗 POST merge guest cart */
router.post("/merge", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const guestId = req.body.guestId;

    if (!guestId) {
      return res.status(400).json({ message: "guestId is required" });
    }

    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: userId });

    // 🛑 Guest cart empty
    if (!guestCart || guestCart.products.length === 0) {
      return res.status(200).json({
        message: "Guest cart empty",
        cart: userCart || { products: [], totalPrice: 0 },
      });
    }

    // 👤 Agar user ka cart nahi hai → guestCart ko hi userCart bana do
    if (!userCart) {
      guestCart.user = userId;
      guestCart.guestId = null;
      guestCart.totalPrice = calculateTotal(guestCart.products);
      await guestCart.save();
      return res.status(200).json({ message: "Cart merged", cart: guestCart });
    }

    // 🔄 Merge guestCart into userCart
    for (const guestItem of guestCart.products) {
      const product = await Product.findById(guestItem.productId);
      if (!product) continue;

      const discountedPrice = getDiscountedPrice(product);

      const existingItem = userCart.products.find(
        (item) =>
          item.productId.toString() === guestItem.productId.toString() &&
          normalize(item.size) === normalize(guestItem.size) &&
          normalizeColor(item.color) === normalizeColor(guestItem.color)
      );

      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
        existingItem.price = discountedPrice; // ✅ Always refresh price
      } else {
        userCart.products.push({
          ...guestItem.toObject(), // 🛠 ensure Mongoose doc converted
          price: discountedPrice,
        });
      }
    }

    // ✅ Recalculate and save
    userCart.totalPrice = calculateTotal(userCart.products);
    await userCart.save();

    // 🗑 Guest cart delete
    await Cart.deleteOne({ guestId });

    res.status(200).json({ message: "Cart merged", cart: userCart });
  } catch (error) {
    console.error("Merge Error:", error.message);
    res.status(500).json({ message: "Merge failed" });
  }
});

module.exports = router;
