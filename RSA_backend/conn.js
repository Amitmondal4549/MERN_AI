const mongoose = require('mongoose');

async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.warn("⚠  MONGO_URI is not set — skipping database connection. Some features will be unavailable.");
    return false;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log("✓ Database connected successfully");
    return true;
  } catch (err) {
    console.error("✗ Database connection error:", err.message);
    return false;
  }
}

module.exports = connectDB;