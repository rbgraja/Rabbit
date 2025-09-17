const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// 📦 Models
const Product = require("./models/products");
const Cart = require("./models/Cart");

// 🧾 Seed data
const products = require("./data/products");

// 🔍 Load .env with absolute path
const envPath = path.resolve(__dirname, "./.env");
console.log("🛠 Loading .env from:", envPath);
dotenv.config({ path: envPath });

// ❗ Ensure MONGO_URL is available
if (!process.env.MONGO_URL) {
  console.error("❌ MONGO_URL not found in .env file");
  process.exit(1);
}

// 🌱 Start seeding
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("✅ MongoDB connected");

    // 🧹 Clean both collections
    await Product.deleteMany();
    await Cart.deleteMany();
    console.log("🧹 Old products and cart data deleted");

    // 📥 Insert new product data
    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ ${insertedProducts.length} products inserted`);

    process.exit();
  })
  .catch((err) => {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  });
