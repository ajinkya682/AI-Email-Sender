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

// Enable CORS (prefer env-specified frontend, fall back to localhost)
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"].filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins,
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
