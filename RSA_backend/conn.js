require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Database Error: MONGO_URI environment variable is not set");
} else {
  mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch(err => {
    console.error("Database Error:", err.message);
  });
}