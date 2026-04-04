import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Basic required env checks for production-safety
if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET in environment variables");
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("Missing MONGODB_URI in environment variables");
  process.exit(1);
}

const app = express();

// Enable CORS (allow any origin to support Vercel deployments and localhost)
app.use(
  cors({
    origin: function (origin, callback) {
      // Reflect the origin for any incoming request to bypass CORS issues, 
      // or allow it if no origin (like curl)
      callback(null, origin || true);
    },
    credentials: true,
  }),
);

// Body parser
app.use(express.json());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "API is running smoothly" });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
