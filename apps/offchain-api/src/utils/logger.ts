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
    level: config.environment === "production" ? "info" : "debug",
    base: undefined,
  },
  transport,
);

/**
 * Get a logger with environment context
 * @param environment The environment (production, staging)
 * @returns A logger with environment context
 */
export function getEnvironmentLogger(environment: string) {
  return logger.child({ environment });
}
