// 🛠 Import Mongoose to define schema and interact with MongoDB
const mongoose = require("mongoose");

// 🔐 Import bcryptjs for password hashing and comparison
const bcrypt = require("bcryptjs");

// 🧱 Define the user schema (structure of user documents in MongoDB)
const userSchema = new mongoose.Schema(
  {
    // 👤 User's full name
    name: {
      type: String,
      required: true,
      trim: true, // removes extra spaces before/after
    },

    // 📧 User's email address (must be unique and valid)
    email: {
      type: String,
      required: true,
      unique: true, // no duplicate emails
      trim: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"], // email regex validation
    },

    // 🔑 User's password (will be hashed before saving)
    password: {
      type: String,
      required: true,
      minlength: 6, // minimum password length
    },

    // 🔁 User role - can be either "customer" or "admin"
    role: {
      type: String,
      enum: ["customer", "admin"], // only allowed values
      default: "customer", // default is customer
    },
  },
  {
    timestamps: true, // 🕒 Automatically adds createdAt and updatedAt fields
  }
);

// 🔒 Mongoose "pre-save" middleware to hash password before saving to DB
userSchema.pre("save", async function (next) {
  // Only run this function if the password field was modified (or new)
  if (!this.isModified("password")) return next();

  // 🔑 Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next(); // continue to save()
});

// 🔍 Custom method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password); // returns true or false
};

// 📤 Export the User model for use in controllers, routes, etc.
module.exports = mongoose.model("User", userSchema);
