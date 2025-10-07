const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('Make sure MongoDB is running and the connection string is correct');
    
    // In production, you might want to continue without DB for some endpoints
    // For now, we'll exit but with a cleaner message
    console.error('Application will exit due to database connection failure');
    process.exit(1);
  }
};

module.exports = connectDB;
