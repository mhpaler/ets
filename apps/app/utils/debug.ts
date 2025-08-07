/**
 * Debug utility for conditional console logging
 * Only logs in development environment
 */
export const debug = {
  /**
   * Log informational messages (only in development)
   */
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.info(message, data);
    }
  },

  /**
   * Log warning messages (only in development)
   */
  warn: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(message, data);
    }
  },

  /**
   * Log error messages (only in development)
   */
  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.error(message, error);
    }
  },

  /**
   * Log general debug messages (only in development)
   */
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(message, data);
    }
  },
};
