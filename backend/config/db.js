// 🛠 Import mongoose for MongoDB connection
const mongoose = require("mongoose");

// 🔌 Create an async function to connect to MongoDB
const connectDB = async () => {
    try {
        // ⛓️ Connect to MongoDB using the connection string from .env file
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // ✅ Successful connection message
        console.log("MongoDB connected successfully");
    } catch (err) {
        // ❌ If connection fails, log the error and exit the process
        console.error("MongoDB connection failed:", err.message);
        process.exit(1); // Exit with failure code
    }
};

// 📤 Export the function to be used in your main server file
module.exports = connectDB;
