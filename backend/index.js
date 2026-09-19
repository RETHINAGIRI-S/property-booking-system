import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

import { router } from "./routes/userRoutes.js";
import { propertyRouter } from "./routes/propertyRouter.js";
import { bookingRouter } from "./routes/bookingRouter.js";
import { tripRouter } from "./routes/tripRouter.js";
import { Property } from "./Models/propertyModel.js";
import connectDB from "./utils/db.js";

dotenv.config();

// ==========================================
// 1. BSON / SEEDER PARSER HELPER
// ==========================================
const parseBSON = (val) => {
  if (val === null || val === undefined) return val;

  if (Array.isArray(val)) {
    return val.map(parseBSON);
  }

  if (typeof val === "object") {
    if ("$oid" in val && Object.keys(val).length === 1) {
      return new mongoose.Types.ObjectId(val.$oid);
    }
    if ("$date" in val && Object.keys(val).length === 1) {
      return new Date(val.$date);
    }
    if ("$numberInt" in val && Object.keys(val).length === 1) {
      return parseInt(val.$numberInt, 10);
    }
    if ("$numberDouble" in val && Object.keys(val).length === 1) {
      return parseFloat(val.$numberDouble);
    }
    if ("$numberLong" in val && Object.keys(val).length === 1) {
      return parseInt(val.$numberLong, 10);
    }

    const cleanObj = {};
    for (const [key, value] of Object.entries(val)) {
      cleanObj[key] = parseBSON(value);
    }
    return cleanObj;
  }

  return val;
};

// ==========================================
// 2. SEEDER FUNCTIONS
// ==========================================
export const seedProperties = async (shouldExit = true) => {
  try {
    await connectDB();

    const possiblePaths = [
      path.resolve("Database", "test.properties.json"),
      path.resolve("backend", "Database", "test.properties.json"),
      path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "Database", "test.properties.json"),
    ];
    const filePath = possiblePaths.find((p) => fs.existsSync(p));
    if (!filePath) {
      console.error(`⚠️ Seed file not found. Checked: ${possiblePaths.join(", ")}`);
      if (shouldExit) process.exit(1);
      return;
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(rawData);
    const properties = parseBSON(json);

    console.log("🧹 Clearing existing properties in MongoDB...");
    await Property.deleteMany({});

    console.log(`📦 Inserting ${properties.length} properties into MongoDB Atlas...`);
    await Property.insertMany(properties, { validateBeforeSave: false });

    console.log(`✅ Successfully seeded ${properties.length} properties!`);
    if (shouldExit) process.exit(0);
  } catch (error) {
    console.error(`❌ Seeder Error: ${error.message}`);
    if (shouldExit) process.exit(1);
  }
};

export const deleteProperties = async (shouldExit = true) => {
  try {
    await connectDB();
    console.log("🧹 Deleting all properties from MongoDB...");
    await Property.deleteMany({});
    console.log("✅ All properties removed from database!");
    if (shouldExit) process.exit(0);
  } catch (error) {
    console.error(`❌ Deletion Error: ${error.message}`);
    if (shouldExit) process.exit(1);
  }
};

// Auto-seed if database is currently empty on startup
const autoSeedIfEmpty = async () => {
  try {
    const count = await Property.countDocuments();
    if (count === 0) {
      console.log("ℹ️ No properties found in DB. Auto-seeding initial dataset...");
      await seedProperties(false);
    } else {
      console.log(`📊 Found ${count} properties already present in MongoDB Atlas.`);
    }
  } catch (err) {
    console.warn("⚠️ Could not verify property count:", err.message);
  }
};

// ==========================================
// 3. EXPRESS APP INITIALIZATION
// ==========================================
const app = express();

// CORS
const allowedOrigins = process.env.ORIGIN_ACCESS_URL
  ? process.env.ORIGIN_ACCESS_URL.split(",").map((url) => url.trim())
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith(".netlify.app") ||
        origin.includes("localhost");
      if (isAllowed || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Express JSON & URL-encoded bodies
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Cookie Parser
app.use(cookieParser());

// Base health route
app.get("/", (req, res) => {
  res.send("Homelyhub server is running");
});

// API Routes
app.use("/api/v1/rent/user", router);
app.use("/api/v1/rent/listing", propertyRouter);
app.use("/api/v1/rent/user/booking", bookingRouter);
app.use("/api/v1/rent/trip", tripRouter);

// ==========================================
// 4. SERVER START / CLI COMMAND HANDLING
// ==========================================
const startServer = async () => {
  const port = process.env.PORT || 8080;

  // Connect to DB
  await connectDB();

  // Check & auto-seed if empty
  await autoSeedIfEmpty();

  // Start HTTP Server
  app.listen(port, () => {
    console.log(`🚀 HomelyHub server running on port: ${port}`);
  });
};

// Check CLI Arguments
const arg = process.argv[2];
if (arg === "-d" || arg === "--delete") {
  deleteProperties(true);
} else if (arg === "-i" || arg === "--import" || arg === "--seed" || arg === "-s") {
  seedProperties(true);
} else {
  // Default: Start Server
  startServer();
}

export default app;
