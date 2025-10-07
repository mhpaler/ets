/**
 * Hierarchical configuration loader
 * Loads environment variables in priority order
 */

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import type { ConfigOptions, ConfigPriority } from "./types";

/**
 * Find the monorepo root by looking for pnpm-workspace.yaml
 */
export function findMonorepoRoot(startDir: string = process.cwd()): string | null {
  let currentDir = startDir;

  while (currentDir !== "/") {
    if (fs.existsSync(path.join(currentDir, "pnpm-workspace.yaml"))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

/**
 * Load environment variables in hierarchical order
 * Priority: defaults < root .env < network .env < .env.local < runtime
 */
export function loadEnvironmentVariables(options: ConfigOptions = {}): void {
  const { environment, envFiles = [], debug = false } = options;

  const log = debug ? console.log : () => {};

  // Find monorepo root
  const rootDir = findMonorepoRoot() || process.cwd();
  log(`🔍 Monorepo root: ${rootDir}`);

  // Determine environment name
  const envName = environment || process.env.ENVIRONMENT || "local";
  log(`🌍 Loading configuration for: ${envName}`);

  // Load in order of increasing priority
  const filesToLoad = [
    // 1. Root .env (shared defaults)
    path.join(rootDir, ".env"),

    // 2. Network-specific config
    path.join(rootDir, `.env.${envName}`),

    // 3. Local overrides (gitignored)
    path.join(rootDir, ".env.local"),

    // 4. Additional files specified by caller
    ...envFiles,
  ];

  for (const filePath of filesToLoad) {
    if (fs.existsSync(filePath)) {
      const result = dotenv.config({ path: filePath });

      if (result.error) {
        log(`❌ Error loading ${filePath}: ${result.error.message}`);
      } else {
        const varsCount = Object.keys(result.parsed || {}).length;
        log(`✅ Loaded ${varsCount} variables from ${path.basename(filePath)}`);
      }
    } else {
      log(`⏭️  Skipping ${path.basename(filePath)} (not found)`);
    }
  }
}

/**
 * Merge environment variables with defaults
 * Higher priority values override lower priority ones
 */
export function mergeWithEnvironment<T extends Record<string, any>>(defaults: T, envPrefix = ""): T {
  const result = { ...defaults } as T;

  // Process each key in defaults
  for (const key of Object.keys(defaults)) {
    // Convert camelCase to SNAKE_CASE for env var
    const envKey = envPrefix + camelCaseToSnakeCase(key).toUpperCase();
    const envValue = process.env[envKey];

    if (envValue !== undefined) {
      // Type conversion based on default value type
      const defaultValue = defaults[key];

      if (typeof defaultValue === "boolean") {
        (result as any)[key] = envValue.toLowerCase() === "true";
      } else if (typeof defaultValue === "number") {
        (result as any)[key] = Number.parseInt(envValue, 10);
      } else if (typeof defaultValue === "object" && defaultValue !== null) {
        // For objects, try to parse as JSON
        try {
          (result as any)[key] = JSON.parse(envValue);
        } catch {
          // If not valid JSON, keep as string
          (result as any)[key] = envValue;
        }
      } else {
        (result as any)[key] = envValue;
      }
    }
  }

  return result;
}

/**
 * Convert camelCase to snake_case
 */
function camelCaseToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
}

/**
 * Get a required environment variable or throw
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

/**
 * Get an optional environment variable with a default
 */
export function getEnv(name: string, defaultValue = ""): string {
  return process.env[name] || defaultValue;
}

/**
 * Check if running in CI environment
 */
export function isCI(): boolean {
  return process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev" || (!process.env.NODE_ENV && !isCI());
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if running in test environment
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined;
}
