// 📦 Required dependencies
const express = require("express");
const Product = require("../models/products"); // 🧱 Product model
const { protect, authorizeRoles } = require("../middleware/auth"); // 🔐 Auth middleware

// 🛠 Create router
const router = express.Router();

// 🔧 Helper function: calculate discounted price
const getDiscountedPrice = (product) => {
  if (!product) return null;
  const price = product.price;
  const discount = product.discount || 0;
  const discountedPrice =
    discount > 0 ? price - (price * discount) / 100 : price;
  return Math.round(discountedPrice);
};

/**
 * ========================================================================
 * @route   GET /api/products
 * @desc    Get all products with filters
 * @access  Public
 * ========================================================================
 */
router.get("/", async (req, res) => {
  try {
    const {
      keyword,
      category,
      brand,
      collection,
      sizes,
      color,
      material,
      gender,
      isActive,
      isFeatured,
      isPublished,
      minPrice,
      maxPrice,
      sort,
      limit,
    } = req.query;

    const filter = { stock: { $gt: 0 } }; // ✅ only in-stock products

    // 🔍 Keyword search
    if (keyword) {
      const regex = new RegExp(keyword, "i");
      filter.$or = [
        { name: regex },
        { description: regex },
        { gender: regex },
        { category: regex },
        { brand: regex },
      ];
    }

    // 🎯 Category
    if (category && category.toLowerCase() !== "all") {
      filter.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    // 🏷️ Brand
    if (brand) {
      const brandArray = brand.split(",").map((b) => new RegExp(`^${b.trim()}$`, "i"));
      filter.brand = { $in: brandArray };
    }

    // 🧥 Collection
    if (collection && collection.toLowerCase() !== "all") {
      filter.collection = { $regex: new RegExp(`^${collection}$`, "i") };
    }

    // 📏 Sizes
    if (sizes) {
      const sizesArray = sizes.split(",").map((s) => s.trim());
      filter.sizes = { $in: sizesArray };
    }

    // 🎨 Colors
    if (color) {
      const colorArray = color.split(",").map((c) => c.trim().toLowerCase());
      filter.colors = { $in: colorArray };
    }

    // 🧵 Material
    if (material) {
      const materialArray = material.split(",").map((m) => new RegExp(`^${m.trim()}$`, "i"));
      filter.material = { $in: materialArray };
    }

    // 🚻 Gender
    if (gender) {
      filter.gender = { $regex: new RegExp(`^${gender}$`, "i") };
    }

    // ✅ Boolean filters
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
    if (isPublished !== undefined) filter.isPublished = isPublished === "true";

    // 💰 Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (!isNaN(minPrice)) filter.price.$gte = Number(minPrice);
      if (!isNaN(maxPrice)) filter.price.$lte = Number(maxPrice);
    }

    // 🔃 Sorting
    let sortOption = {};
    switch (sort) {
      case "price_asc":
        sortOption.price = 1;
        break;
      case "price_desc":
        sortOption.price = -1;
        break;
      case "latest":
        sortOption.createdAt = -1;
        break;
      case "popular":
        sortOption.rating = -1;
        break;
      default:
        sortOption.createdAt = -1;
    }

    // 🧮 Fetch products
    const productQuery = Product.find(filter).sort(sortOption);
    if (limit && !isNaN(limit)) productQuery.limit(Number(limit));
    const products = await productQuery;

    // Attach discounted price
    const productsWithDiscount = products.map((p) => ({
      ...p._doc,
      discountedPrice: getDiscountedPrice(p),
    }));

    res.status(200).json({ products: productsWithDiscount });
  } catch (err) {
    console.error("🔥 Fetch Products Error:", err);
    res.status(500).json({ message: err.message || "Server Error" });
  }
});

/**
 * ========================================================================
 * @route   GET /api/products/filters
 * @desc    Get available filter options dynamically from DB
 * @access  Public
 * ========================================================================
 */
router.get("/filters", async (req, res) => {
  try {
    const query = {};
    if (req.query.gender) query.gender = req.query.gender;
    if (req.query.category) query.category = req.query.category;
    if (req.query.brand) query.brand = { $in: req.query.brand.split(",") };
    if (req.query.size) query.sizes = { $in: req.query.size.split(",") };
    if (req.query.material) query.material = { $in: req.query.material.split(",") };
    if (req.query.color) query.colors = { $in: req.query.color.split(",") };
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    const categories = (await Product.distinct("category", query)) || [];
    const colors = (await Product.distinct("colors", query)) || [];
    const sizes = (await Product.distinct("sizes", query)) || [];
    const materials = (await Product.distinct("material", query)) || [];
    const brands = (await Product.distinct("brand", query)) || [];
    const genders = (await Product.distinct("gender", query)) || [];

    res.status(200).json({
      categories: categories.filter(Boolean),
      colors: colors.filter(Boolean),
      sizes: sizes.filter(Boolean),
      materials: materials.filter(Boolean),
      brands: brands.filter(Boolean),
      genders: genders.filter(Boolean),
    });
  } catch (err) {
    console.error("❌ Fetch Filter Options Error:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

/**
 * ========================================================================
 * @route   GET /api/products/best-sellers
 * @desc    Get top N best-selling products
 * @access  Public
 * ========================================================================
 */
router.get("/best-sellers", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const bestSellers = await Product.find({
      isActive: true,
      isPublished: true,
      stock: { $gt: 0 },
      rating: { $gt: 0 },
      numReviews: { $gt: 0 },
    })
      .sort([
        ["rating", -1],
        ["numReviews", -1],
      ])
      .limit(limit);

    const bestSellersWithDiscount = bestSellers.map((p) => ({
      ...p._doc,
      discountedPrice: getDiscountedPrice(p),
    }));

    res.status(200).json(bestSellersWithDiscount);
  } catch (err) {
    console.error("❌ Fetch Best Sellers Error:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

/**
 * ========================================================================
 * @route   GET /api/products/new-arrivals
 * @desc    Get latest created products
 * @access  Public
 * ========================================================================
 */
router.get("/new-arrivals", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const newArrivals = await Product.find({
      isActive: true,
      isPublished: true,
      stock: { $gt: 0 },
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    const arrivalsWithDiscount = newArrivals.map((p) => ({
      ...p._doc,
      discountedPrice: getDiscountedPrice(p),
    }));

    res.status(200).json(arrivalsWithDiscount);
  } catch (err) {
    console.error("❌ Fetch New Arrivals Error:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

/**
 * ========================================================================
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 * ========================================================================
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({
      ...product._doc,
      discountedPrice: getDiscountedPrice(product),
    });
  } catch (err) {
    console.error("Get Product By ID Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * ========================================================================
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (admin only)
 * ========================================================================
 */
router.put("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });

    res.json({
      ...updatedProduct._doc,
      discountedPrice: getDiscountedPrice(updatedProduct),
    });
  } catch (err) {
    console.error("Update Product Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * ========================================================================
 * @route   GET /api/products/similar/:id
 * @desc    Retrieve similar products
 * @access  Public
 * ========================================================================
 */
router.get("/similar/:id", async (req, res) => {
  try {
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const similarProducts = await Product.find({
      _id: { $ne: currentProduct._id },
      category: currentProduct.category,
      gender: currentProduct.gender,
      isActive: true,
      isPublished: true,
      stock: { $gt: 0 },
    }).limit(4);

    const similarWithDiscount = similarProducts.map((p) => ({
      ...p._doc,
      discountedPrice: getDiscountedPrice(p),
    }));

    res.json(similarWithDiscount);
  } catch (err) {
    console.error("Fetch Similar Products Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * ========================================================================
 * @route   POST /api/products/:id/reviews
 * @desc    Add review to product
 * @access  Private (logged-in users)
 * ========================================================================
 */
router.post("/:id/reviews", protect, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user.id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    const review = {
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      product.numReviews;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } catch (err) {
    console.error("Add Review Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// 📤 Export router
module.exports = router;
