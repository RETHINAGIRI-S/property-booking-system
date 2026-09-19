import mongoose from "mongoose";
import dns from "node:dns";

// Fix for Windows/ISP DNS resolution issues with MongoDB Atlas SRV records
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  // Ignore if not supported in environment
}

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes("<db_username>")) {
      console.warn("MongoDB URI contains placeholder credentials. Please update .env with your actual username and password.");
      return;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};

export default connectDB;
export { connectDB };
