import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // fail fast – 10s instead of 30s
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error(
      "⚠️  Server will continue but database-dependent routes will fail."
    );
    console.error(
      "   Fix: whitelist your IP in MongoDB Atlas → Network Access."
    );
    // Do NOT exit – let the server start so we can at least hit /api/health
  }
};

export default connectDB;
