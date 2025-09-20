import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

// Extend Express Request type to include auth info
declare global {
  namespace Express {
    interface Request {
      apiKeyId?: string;
      isInternal?: boolean;
    }
  }
}

export interface AuthConfig {
  enforceInProduction: boolean;
  internalApiKey?: string;
  allowedApiKeys?: string[];
  allowedIPs?: string[];
}

/**
 * API Key authentication middleware
 * Protects sensitive endpoints from unauthorized access
 */
export function requireAPIKey(config: AuthConfig = { enforceInProduction: true }) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip authentication in development mode (unless explicitly enforced)
    if (process.env.NODE_ENV === "development" && !config.enforceInProduction) {
      logger.info("Auth bypassed in development mode", {
        endpoint: req.path,
        method: req.method,
      });
      req.isInternal = true;
      return next();
    }

    const apiKey = req.headers["x-api-key"] as string;
    const userAgent = req.headers["user-agent"];
    const clientIP = req.ip || req.connection.remoteAddress || "unknown";

    // Log authentication attempt
    logger.info("API authentication attempt", {
      endpoint: req.path,
      method: req.method,
      hasApiKey: !!apiKey,
      userAgent,
      clientIP,
    });

    // Check API key
    if (!apiKey) {
      logger.warn("API key missing", {
        endpoint: req.path,
        method: req.method,
        clientIP,
      });

      return res.status(401).json({
        success: false,
        error: "API key required",
        message: "Please provide a valid API key in the x-api-key header",
      });
    }

    // Validate API key
    const isValidKey = validateAPIKey(apiKey, config);
    if (!isValidKey.valid) {
      logger.warn("API key invalid", {
        endpoint: req.path,
        method: req.method,
        apiKeyPrefix: `${apiKey.slice(0, 8)}...`,
        clientIP,
        reason: isValidKey.reason,
      });

      return res.status(401).json({
        success: false,
        error: "Invalid API key",
        message: "The provided API key is not valid",
      });
    }

    // Check IP allowlist if configured
    if (config.allowedIPs && config.allowedIPs.length > 0) {
      if (!config.allowedIPs.includes(clientIP)) {
        logger.warn("IP not allowed", {
          endpoint: req.path,
          method: req.method,
          clientIP,
          allowedIPs: config.allowedIPs,
        });

        return res.status(403).json({
          success: false,
          error: "IP not allowed",
          message: "Your IP address is not authorized to access this endpoint",
        });
      }
    }

    // Set request context
    req.apiKeyId = isValidKey.keyId;
    req.isInternal = isValidKey.isInternal;

    logger.info("API authentication successful", {
      endpoint: req.path,
      method: req.method,
      apiKeyId: req.apiKeyId,
      isInternal: req.isInternal,
      clientIP,
    });

    next();
  };
}

/**
 * Validate API key against configured keys
 */
function validateAPIKey(
  providedKey: string,
  config: AuthConfig,
): { valid: boolean; keyId?: string; isInternal?: boolean; reason?: string } {
  // Check internal API key (for event processor)
  if (config.internalApiKey && providedKey === config.internalApiKey) {
    return {
      valid: true,
      keyId: "internal-event-processor",
      isInternal: true,
    };
  }

  // Check allowed API keys
  if (config.allowedApiKeys?.includes(providedKey)) {
    const keyIndex = config.allowedApiKeys.indexOf(providedKey);
    return {
      valid: true,
      keyId: `external-${keyIndex}`,
      isInternal: false,
    };
  }

  // Default validation against environment variable
  const envApiKey = process.env.INTERNAL_API_KEY;
  if (envApiKey && providedKey === envApiKey) {
    return {
      valid: true,
      keyId: "env-internal",
      isInternal: true,
    };
  }

  return {
    valid: false,
    reason: "Key not found in allowed keys",
  };
}

/**
 * Middleware specifically for event processor endpoints
 * Requires internal API key and optionally IP validation
 */
export function requireEventProcessorAuth() {
  const eventProcessorIPs = process.env.EVENT_PROCESSOR_ALLOWED_IPS?.split(",") || [];

  return requireAPIKey({
    enforceInProduction: true,
    internalApiKey: process.env.EVENT_PROCESSOR_API_KEY || process.env.INTERNAL_API_KEY,
    allowedIPs: eventProcessorIPs.length > 0 ? eventProcessorIPs : undefined,
  });
}

/**
 * Rate limiting middleware (basic implementation)
 */
export function rateLimit(options: {
  windowMs: number;
  max: number;
  message?: string;
}) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.apiKeyId || req.ip || "anonymous";
    const now = Date.now();
    const windowStart = Math.floor(now / options.windowMs) * options.windowMs;
    const resetTime = windowStart + options.windowMs;

    const current = requests.get(identifier);

    if (!current || current.resetTime !== resetTime) {
      // New window or first request
      requests.set(identifier, { count: 1, resetTime });
      return next();
    }

    if (current.count >= options.max) {
      logger.warn("Rate limit exceeded", {
        identifier,
        count: current.count,
        max: options.max,
        resetTime,
      });

      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded",
        message: options.message || `Too many requests. Try again in ${Math.ceil((resetTime - now) / 1000)} seconds.`,
        retryAfter: Math.ceil((resetTime - now) / 1000),
      });
    }

    current.count++;
    next();
  };
}

export default requireAPIKey;
