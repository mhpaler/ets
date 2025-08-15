import cors from "cors";
import express from "express";
import helmet from "helmet";
import { requireAPIKey, requireOracleAuth } from "./middleware/auth";
import auctionRoutes from "./routes/auctionRoutes";
import metadataRoutes from "./routes/metadataRoutes";
import tagCoinRoutes from "./routes/tagCoinRoutes";
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

// Protected TAG Coin routes (require oracle authentication)
app.use("/api/tag-coin", requireOracleAuth(), tagCoinRoutes);

// Protected metadata routes (require API key)
app.use("/api/metadata", requireAPIKey({ enforceInProduction: false }), metadataRoutes);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handling
app.use(errorHandler);

export default app;
