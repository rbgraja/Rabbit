// 🛠 Import mongoose for schema/model creation
const mongoose = require("mongoose");

// 🎨 Subschema for colors
const colorSchema = new mongoose.Schema(
  {
    hex: {
      type: String,
      required: [true, "Please provide color hex code"], // e.g., #FFFFFF
      trim: true,
    },
    name: {
      type: String, // e.g., White, Red
      trim: true,
      default: "",
    },
  },
  { _id: false } // we don’t need separate _id for each color
);

// 🧱 Define the Product schema
const productSchema = new mongoose.Schema(
  {
    // 📛 Product name
    name: {
      type: String,
      required: [true, "Please enter product name"],
      trim: true,
    },

    // 🔢 SKU - Stock Keeping Unit (unique product identifier)
    sku: {
      type: String,
      required: [true, "Please enter product SKU"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    // 🏷️ Brand name
    brand: {
      type: String,
      trim: true,
    },

    // 🧾 Full description of the product
    description: {
      type: String,
      required: [true, "Please enter product description"],
    },

    // 💲 Price of the product
    price: {
      type: Number,
      required: [true, "Please enter product price"],
      min: [0, "Price must be a positive number"],
    },

    // 📦 Discount (optional, in %)
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // 🖼️ Array of product images
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          default: "",
        },
      },
    ],

    // 🧾 Category (e.g., clothing, electronics)
    category: {
      type: String,
      required: [true, "Please enter product category"],
    },

    // 📚 Collection/Season name (e.g., "Summer 2025")
    collection: {
      type: String,
      required: [true, "Please specify product collection"],
      trim: true,
    },

    // 🎨 Product colors (array of objects now)
    colors: {
      type: [colorSchema],
      default: [],
    },

    // 🧵 Material type (e.g., Cotton, Leather)
    material: {
      type: String,
      trim: true,
    },

    // 📏 Size (e.g., S, M, L, XL)
    sizes: {
      type: [String],
      default: [],
    },

    // 🚻 Gender targeting
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex"],
      default: "Unisex",
    },

    // 📦 Number of units in stock
    stock: {
      type: Number,
      required: [true, "Please add product stock"],
      min: 0,
    },

    // 🔥 Is this product featured on homepage?
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // ✅ Is this product active for sale?
    isActive: {
      type: Boolean,
      default: true,
    },

    // 🚀 Has this product been published and visible publicly?
    isPublished: {
      type: Boolean,
      default: false,
    },

    // 🌟 Average customer rating
    rating: {
      type: Number,
      default: 0,
    },

    // 🧾 Number of customer reviews
    numReviews: {
      type: Number,
      default: 0,
    },

    // 🧑‍💬 Customer reviews
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Link to user
        },
        name: {
          type: String,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // 🧑‍💼 Admin who created the product
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt
  }
);

// 📤 Export model
module.exports = mongoose.model("Product", productSchema);
