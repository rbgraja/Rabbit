// 🛠 Importing required modules
const express = require("express"); // Express is a framework to build REST APIs easily
const cors = require("cors"); // CORS allows frontend (like React) to access this backend
const dotenv = require("dotenv"); // 🔐 dotenv loads environment variables from a .env file
const connectDB = require("./config/db"); // 🔗 Import MongoDB connection function

// 🧭 Route Files
const userRoutes = require("./routes/userroutes");
const productRoutes = require("./routes/productroute"); // ✅ Added Product Route
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutroutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const subscriberRoutes = require("./routes/subscriberRoutes");
const adminRoutes = require("./routes/adminRoutes");
const testimonialRoutes = require('./routes/testimonialRoutes');
// ⚙️ Load environment variables from .env file into process.env
dotenv.config(); // This should be at the top before accessing any environment variable

// 🚀 Creating an Express application
const app = express();

// 🧠 Middleware to parse JSON data in incoming requests
app.use(express.json());

// 🌐 Enable CORS so that frontend running on another port/domain can access this backend
app.use(cors());

// 🌍 Define the port number where the server will run, fallback to 3000 if not defined in .env
const PORT = process.env.PORT || 3000;

// 🔌 Connect to MongoDB before starting the server
connectDB();

//API ROUTES
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes); // ✅ Registered Product API routes
app.use("/api/cart", cartRoutes); // ✅ REGISTER THIS ROUTE
app.use("/api/checkout", checkoutRoutes); 
app.use("/api/orders", orderRoutes); 
app.use("/api/upload", uploadRoutes); 
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/admin", adminRoutes); 
app.use('/api/testimonials', testimonialRoutes);


// 📞 Define a simple GET route at root URL
app.get("/", (req, res) => {
    res.send("Welcome to the rabbitapi"); // Respond with a welcome message
});

// ▶️ Start the server and listen on defined port
app.listen(PORT, () => { 
    console.log(`Server is running on http://localhost:${PORT}`);
});

/* 
=====================================
📄 Usage Guide for this Express File:
=====================================

✅ 1. Required Packages:
   You must install these packages using the terminal:
   --> npm install express cors dotenv mongoose

✅ 2. File Name:
   This file can be named 'server.js', 'index.js', or any custom name.
   Just make sure it matches the "main" entry in package.json (default: "index.js")

✅ 3. .env File Setup:
   Create a `.env` file in the root of your project and add environment variables like:
   ---------------------
   PORT=9000
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname
   JWT_SECRET=mysecretkey
   ---------------------

   📌 Make sure `.env` is listed in your `.gitignore` file to avoid exposing secrets:
   --> Add `.env` to `.gitignore`

✅ 4. MongoDB Setup (config/db.js):
   Create a file at `./config/db.js` with the following code:

   const mongoose = require("mongoose");

   const connectDB = async () => {
     try {
       await mongoose.connect(process.env.MONGO_URL, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
       });
       console.log("MongoDB connected successfully");
     } catch (error) {
       console.error("MongoDB connection failed:", error.message);
       process.exit(1);
     }
   };

   module.exports = connectDB;

✅ 5. package.json Setup:
   Your `package.json` should have at least these dependencies:

   "dependencies": {
     "cors": "^2.8.5",
     "dotenv": "^16.3.1",
     "express": "^4.18.2",
     "mongoose": "^7.6.0"
   }

✅ 6. Optional: Start Script
   If you want to run the server using npm start, add this in package.json:

   "scripts": {
     "start": "node server.js"
   }

✅ 7. Optional: Use nodemon for auto-reload during development
   Install nodemon as a dev dependency:
   --> npm install --save-dev nodemon

   Then add this script:
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }

   Run development server with:
   --> npm run dev

=====================================
*/
