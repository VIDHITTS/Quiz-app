const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log("MongoDB URI:", process.env.MONGO_URI ? "Set" : "Not set");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);

    // Check for specific Atlas errors
    if (
      err.message.includes("IP address") ||
      err.message.includes("whitelist")
    ) {
      console.error("⚠️  ATLAS IP WHITELIST ERROR:");
      console.error("   1. Go to MongoDB Atlas dashboard");
      console.error("   2. Navigate to Network Access");
      console.error("   3. Add 0.0.0.0/0 to allow all IPs (for deployment)");
      console.error("   4. Or add your deployment platform's IP addresses");
    }

    console.error("Application will exit due to database connection failure");
    process.exit(1);
  }
};

module.exports = connectDB;
