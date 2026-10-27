const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing from the project root .env file.");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected successfully.");
}

module.exports = connectDB;
