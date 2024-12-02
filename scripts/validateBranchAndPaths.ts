/**
 * Branch and Path Validation Script
 *
 * Enforces monorepo branch structure rules:
 * - Changes to /apps/* must come from stage-based branches
 * - Changes to /packages/* must come from main-based branches
 */

import { execSync } from "node:child_process";

/**
 * Determines if the current branch is based on main or stage
 * Uses git merge-base to trace branch ancestry
 */
function getBaseBranch(): string {
  try {
    const mergeBase = execSync("git merge-base HEAD main", { encoding: "utf8" }).trim();
    const mainHead = execSync("git rev-parse main", { encoding: "utf8" }).trim();
    return mergeBase === mainHead ? "main" : "stage";
  } catch {
    return "unknown";
  }
}

/**
 * Gets list of files staged for commit
 * Returns array of file paths relative to repo root
 */
function getModifiedFiles(): string[] {
  return execSync("git diff --cached --name-only", { encoding: "utf8" }).split("\n").filter(Boolean);
}

/**
 * Path rule configuration type
 */
type PathRule = {
  path: string; // Directory path to check
  allowedBranch: string; // Branch that changes must come from
  message: string; // Error message if rule is violated
};

/**
 * Paths that can be modified from any branch
 */
const allowedFromAnyBranch = [
  // Root config files
  "pnpm-lock.yaml",
  "package.json",
  "turbo.json",
  "tsconfig.json",
  "biome.json",
  "knip.json",

  // Development tooling
  ".vscode/",
  ".github/",
  ".husky/",
  ".changeset/",

  // Documentation and meta
  "README.md",
  "LICENSE",
  ".gitignore",
  ".npmrc",
  ".env.example",

  // Scripts
  "scripts/",
];

/**
 * Monorepo path rules
 * Define which paths must be modified from which base branches
 */
const rules: PathRule[] = [
  {
    path: "apps/",
    allowedBranch: "stage",
    message: "Changes to /apps/* must be made from a branch based on 'stage'",
  },
  {
    path: "packages/",
    allowedBranch: "main",
    message: "Changes to /packages/* must be made from a branch based on 'main'",
  },
];

// Get current branch and modified files
const baseBranch = getBaseBranch();
const modifiedFiles = getModifiedFiles();

// Check each rule against modified files
for (const rule of rules) {
  const hasPathChanges = modifiedFiles.some(
    (file) =>
      file.startsWith(rule.path) &&
      !allowedFromAnyBranch.some((allowed) => file === allowed || file.startsWith(allowed)),
  );

  if (hasPathChanges && baseBranch !== rule.allowedBranch) {
    console.error(`\x1b[31mError: ${rule.message}\x1b[0m`);
    process.exit(1);
  }
}
