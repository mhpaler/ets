import pino from "pino";
import { config } from "../config";

const transport = pino.transport({
  target: "pino-pretty",
  options: {
    colorize: config.environment !== "production",
    translateTime: "SYS:standard",
    ignore: "pid,hostname",
  },
});

export const logger = pino(
  {
    level: config.logLevel === "debug" ? "debug" : config.environment === "production" ? "info" : "debug",
    base: undefined,
  },
  transport,
);

/**
 * Get a logger with component context
 * @param component The component name (e.g., "TargetEnrichmentHandler", "EventProcessor")
 * @returns A logger with component context
 */
export function getComponentLogger(component: string) {
  return logger.child({ component });
}

/**
 * Get a logger with environment context
 * @param environment The environment (production, staging, localhost)
 * @returns A logger with environment context
 */
export function getEnvironmentLogger(environment: string) {
  return logger.child({ environment });
}

/**
 * Get a logger with event processing context
 * @param targetId The target ID being processed
 * @param chainId The chain ID
 * @param eventType The type of event (TargetCreated, EnrichTargetRequested, etc.)
 * @returns A logger with full event processing context
 */
export function getEventLogger(targetId: string, chainId: number, eventType: string) {
  return logger.child({
    targetId,
    chainId,
    eventType,
    component: "EventProcessor",
  });
}
