// 📦 Required dependencies
const express = require("express");
const Product = require("../models/products"); // 🧱 Product model
const { protect, authorizeRoles } = require("../middleware/auth"); // 🔐 Auth middleware

// 🛠 Create router
const router = express.Router();

/**
 * ========================================================================
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (admin only)
 * ========================================================================
 */
router.post("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      createdBy: req.user.id,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Create Product Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * ========================================================================
 * @route   GET /api/products
 * @desc    Get all products with optional filters & sorting
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

    const filter = {
      stock: { $gt: 0 }, // ✅ sirf in-stock products
    };

    // 🔍 Keyword search across name, description, etc.
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
      filter.brand = { $regex: new RegExp(`^${brand}$`, "i") };
    }

    // 🧥 Collection
    if (collection && collection.toLowerCase() !== "all") {
      filter.collection = { $regex: new RegExp(`^${collection}$`, "i") };
    }

    // 📏 Sizes
    if (sizes) {
      filter.sizes = sizes;
    }

    // 🎨 Colors
    if (color) {
      filter.colors = { $in: [color.toLowerCase()] };
    }

    // 🧵 Material
    if (material) {
      const materialArray = material
        .split(",")
        .map((mat) => new RegExp(`^${mat.trim()}$`, "i"));
      filter.material = { $in: materialArray };
    }

    // 🚻 Gender
    if (gender) {
      filter.gender = { $regex: new RegExp(`^${gender}$`, "i") };
    }

    // ✅ Boolean values
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
    if (isPublished !== undefined) filter.isPublished = isPublished === "true";

    // 💰 Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (!isNaN(minPrice)) filter.price.$gte = Number(minPrice);
      if (!isNaN(maxPrice)) filter.price.$lte = Number(maxPrice);
    }

    // 🔃 Sort options
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

    // 🧮 Fetch products with filters
    const productQuery = Product.find(filter).sort(sortOption);

    if (limit && !isNaN(limit)) {
      productQuery.limit(Number(limit));
    }

    const products = await productQuery;
    res.status(200).json({ products });
  } catch (err) {
    console.error("🔥 Fetch Products Error:", err);
    res.status(500).json({ message: err.message || "Server Error" });
  }
});

/**
 * ========================================================================
 * @route   GET /api/products/filters
 * @desc    Get available filter options dynamically from DB (with cache)
 * @access  Public
 * ========================================================================
 */
let filterCache = null;
let lastFetch = 0;

router.get("/filters", async (req, res) => {
  try {
    // Cache 30 seconds
    if (filterCache && Date.now() - lastFetch < 30 * 1000) {
      return res.status(200).json(filterCache);
    }

    const [categories, colors, sizes, materials, brands, genders] = await Promise.all([
      Product.distinct("category"),
      Product.distinct("colors"),
      Product.distinct("sizes"),
      Product.distinct("material"),
      Product.distinct("brand"),
      Product.distinct("gender"),
    ]);

    filterCache = {
      categories: categories.filter(Boolean),
      colors: colors.filter(Boolean),
      sizes: sizes.filter(Boolean),
      materials: materials.filter(Boolean),
      brands: brands.filter(Boolean),
      genders: genders.filter(Boolean),
    };
    lastFetch = Date.now();

    res.status(200).json(filterCache);
  } catch (err) {
    console.error("❌ Fetch Filter Options Error:", err.message);
    res.status(500).json({ message: "Server Error" });
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

    res.status(200).json(bestSellers);
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

    res.status(200).json(newArrivals);
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

    res.json(product);
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

    res.json(updatedProduct);
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

    res.json(similarProducts);
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
    if (!product)
      return res.status(404).json({ message: "Product not found" });

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
