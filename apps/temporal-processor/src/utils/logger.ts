import pino from "pino";
import { config } from "../config";

// Create base logger instance
export const logger = pino({
  level: config.logLevel,
  transport:
    config.env === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Create component-specific loggers
export function getComponentLogger(component: string) {
  return logger.child({ component });
}
