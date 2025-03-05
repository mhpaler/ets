import cors from "cors";
import express from "express";
import helmet from "helmet";
import auctionRoutes from "./routes/auctionRoutes";
import targetRoutes from "./routes/targetRoutes";
import { errorHandler } from "./utils/errorHandler";
import { logger } from "./utils/logger";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auction", auctionRoutes);
app.use("/api/target", targetRoutes);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handling
app.use(errorHandler);

export default app;
