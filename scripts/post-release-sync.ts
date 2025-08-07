#!/usr/bin/env bun

/**
 * Post-Release Synchronization Script
 *
 * Automates the post-release workflow to sync all branches and repositories
 * after changesets deployment and automated release changes.
 *
 * Usage:
 *   bun scripts/post-release-sync.ts [--dry-run] [--force]
 *
 * Options:
 *   --dry-run  Show what would be done without executing
 *   --force    Skip safety checks and force operations
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import process from "node:process";

// Configuration
const CONFIG = {
  mainBranch: "main",
  stageBranch: "stage",
  upstreamRemote: "upstream",
  originRemote: "origin",
  requiredRemotes: ["upstream", "origin"],
} as const;

// CLI arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isForced = args.includes("--force");

// Utilities
function execCommand(command: string, description: string): string {
  console.log(`🔄 ${description}`);

  if (isDryRun) {
    console.log(`   [DRY RUN] Would run: ${command}`);
    return "";
  }

  try {
    const result = execSync(command, {
      encoding: "utf-8",
      stdio: ["inherit", "pipe", "pipe"],
    });
    console.log(`   ✅ ${description} completed`);
    return result.trim();
  } catch (error: any) {
    console.error(`   ❌ Failed: ${description}`);
    console.error(`   Command: ${command}`);
    console.error(`   Error: ${error.message}`);
    throw error;
  }
}

function getCurrentBranch(): string {
  try {
    return execSync("git branch --show-current", { encoding: "utf-8" }).trim();
  } catch {
    throw new Error("Failed to get current branch. Are you in a git repository?");
  }
}

function hasUncommittedChanges(): boolean {
  try {
    const status = execSync("git status --porcelain", { encoding: "utf-8" });
    return status.trim().length > 0;
  } catch {
    return false;
  }
}

function branchExists(branch: string): boolean {
  try {
    execSync(`git show-ref --verify --quiet refs/heads/${branch}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function remoteBranchExists(remote: string, branch: string): boolean {
  try {
    execSync(`git show-ref --verify --quiet refs/remotes/${remote}/${branch}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Safety checks
function performSafetyChecks(): void {
  console.log("🔍 Performing safety checks...");

  // Check if we're in a git repository
  if (!existsSync(".git")) {
    throw new Error("Not in a git repository root");
  }

  // Check for uncommitted changes
  if (hasUncommittedChanges() && !isForced) {
    throw new Error(
      "Uncommitted changes detected. Please commit or stash them first.\n" + "Use --force to override this check.",
    );
  }

  // Check required remotes exist
  for (const remote of CONFIG.requiredRemotes) {
    try {
      execSync(`git remote get-url ${remote}`, { stdio: "ignore" });
    } catch {
      throw new Error(`Required remote '${remote}' not found`);
    }
  }

  // Check required branches exist
  if (!branchExists(CONFIG.mainBranch)) {
    throw new Error(`Branch '${CONFIG.mainBranch}' not found locally`);
  }

  if (!branchExists(CONFIG.stageBranch)) {
    throw new Error(`Branch '${CONFIG.stageBranch}' not found locally`);
  }

  console.log("   ✅ All safety checks passed");
}

// Main synchronization logic
async function syncPostRelease(): Promise<void> {
  const originalBranch = getCurrentBranch();
  let currentBranch = originalBranch;

  console.log("📦 Starting post-release synchronization...");
  console.log(`   Current branch: ${currentBranch}`);

  try {
    // Step 1: Fetch all remotes
    execCommand(
      `git fetch ${CONFIG.upstreamRemote} ${CONFIG.originRemote}`,
      "Fetching latest changes from all remotes",
    );

    // Step 2: Switch to main and sync with upstream
    if (currentBranch !== CONFIG.mainBranch) {
      execCommand(`git checkout ${CONFIG.mainBranch}`, `Switching to ${CONFIG.mainBranch} branch`);
      currentBranch = CONFIG.mainBranch;
    }

    execCommand(
      `git pull ${CONFIG.upstreamRemote} ${CONFIG.mainBranch}`,
      `Pulling latest ${CONFIG.mainBranch} from upstream`,
    );

    execCommand(
      `git push ${CONFIG.originRemote} ${CONFIG.mainBranch}`,
      `Pushing updated ${CONFIG.mainBranch} to origin`,
    );

    // Step 3: Switch to stage and merge main
    execCommand(`git checkout ${CONFIG.stageBranch}`, `Switching to ${CONFIG.stageBranch} branch`);
    currentBranch = CONFIG.stageBranch;

    execCommand(`git merge ${CONFIG.mainBranch}`, `Merging ${CONFIG.mainBranch} into ${CONFIG.stageBranch}`);

    // Step 4: Sync stage with upstream
    if (remoteBranchExists(CONFIG.upstreamRemote, CONFIG.stageBranch)) {
      try {
        execCommand(
          `git pull ${CONFIG.upstreamRemote} ${CONFIG.stageBranch}`,
          `Pulling latest ${CONFIG.stageBranch} from upstream`,
        );
      } catch (_error) {
        console.log("   ⚠️  Auto-merge failed, attempting manual merge...");
        execCommand(
          `git merge ${CONFIG.upstreamRemote}/${CONFIG.stageBranch}`,
          `Manually merging upstream/${CONFIG.stageBranch}`,
        );
      }
    }

    // Step 5: Sync stage with origin
    if (remoteBranchExists(CONFIG.originRemote, CONFIG.stageBranch)) {
      try {
        execCommand(
          `git pull ${CONFIG.originRemote} ${CONFIG.stageBranch}`,
          `Pulling latest ${CONFIG.stageBranch} from origin`,
        );
      } catch (_error) {
        console.log("   ⚠️  Auto-merge failed, attempting manual merge...");
        execCommand(
          `git merge ${CONFIG.originRemote}/${CONFIG.stageBranch}`,
          `Manually merging origin/${CONFIG.stageBranch}`,
        );
      }
    }

    // Step 6: Push synchronized stage to both remotes
    execCommand(
      `git push ${CONFIG.originRemote} ${CONFIG.stageBranch}`,
      `Pushing synchronized ${CONFIG.stageBranch} to origin`,
    );

    execCommand(
      `git push ${CONFIG.upstreamRemote} ${CONFIG.stageBranch}`,
      `Pushing synchronized ${CONFIG.stageBranch} to upstream`,
    );

    // Step 7: Return to original branch if needed
    if (originalBranch !== currentBranch) {
      execCommand(`git checkout ${originalBranch}`, `Returning to original branch: ${originalBranch}`);

      // Offer to update working branch
      if (originalBranch !== CONFIG.stageBranch && originalBranch !== CONFIG.mainBranch) {
        console.log(`\n💡 Working branch detected: ${originalBranch}`);
        console.log(`   Consider running: git merge ${CONFIG.stageBranch}`);
        console.log("   To update your working branch with the latest changes.");
      }
    }

    // Step 8: Show final status
    console.log("\n🎉 Post-release synchronization completed successfully!");
    console.log("\n📊 Final status:");

    if (!isDryRun) {
      const mainHash = execSync(`git rev-parse ${CONFIG.mainBranch}`, { encoding: "utf-8" }).trim().slice(0, 8);
      const stageHash = execSync(`git rev-parse ${CONFIG.stageBranch}`, { encoding: "utf-8" }).trim().slice(0, 8);

      console.log(`   ${CONFIG.mainBranch}:  ${mainHash} (synchronized with upstream)`);
      console.log(`   ${CONFIG.stageBranch}: ${stageHash} (synchronized with upstream and origin)`);
      console.log(`   Current: ${getCurrentBranch()}`);
    }

    // Cleanup suggestions
    console.log("\n🧹 Cleanup suggestions:");
    console.log("   • Team members should run: git pull origin stage");
    console.log("   • Update any stale working branches: git merge stage");
    console.log("   • Consider running: git remote prune origin && git remote prune upstream");
  } catch (error: any) {
    console.error(`\n❌ Post-release synchronization failed: ${error.message}`);

    // Attempt to return to original branch on failure
    if (currentBranch !== originalBranch) {
      try {
        execCommand(`git checkout ${originalBranch}`, "Returning to original branch after failure");
      } catch {
        console.error(`⚠️  Could not return to original branch: ${originalBranch}`);
      }
    }

    process.exit(1);
  }
}

// Main execution
async function main(): Promise<void> {
  console.log("🚀 ETS Post-Release Synchronization Script\n");

  if (isDryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made\n");
  }

  if (isForced) {
    console.log("⚠️  FORCE MODE - Safety checks will be skipped\n");
  }

  try {
    if (!isForced) {
      performSafetyChecks();
      console.log();
    }

    await syncPostRelease();
  } catch (error: any) {
    console.error(`\n💥 Script failed: ${error.message}`);
    console.error("\nTroubleshooting:");
    console.error("• Ensure you have committed all changes");
    console.error("• Verify upstream and origin remotes are configured");
    console.error("• Check that main and stage branches exist");
    console.error("• Use --dry-run to see what would be executed");
    console.error("• Use --force to override safety checks");

    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
