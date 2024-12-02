import { execSync } from "node:child_process";

function remoteExists(remoteName: string): boolean {
  try {
    execSync(`git remote get-url ${remoteName}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function setupFork(): void {
  try {
    // Check and add upstream remote if it doesn't exist
    if (!remoteExists("upstream")) {
      console.log("🔗 Adding upstream remote...");
      execSync("git remote add upstream git@github.com:ethereum-tag-service/ets.git");
    } else {
      console.log("✅ Upstream remote already configured");
    }

    // Fetch all branches from upstream
    console.log("📥 Fetching upstream branches...");
    execSync("git fetch upstream");

    // Set up main branch tracking
    console.log("🔄 Setting up main branch...");
    execSync("git checkout main");
    execSync("git branch --set-upstream-to origin/main main");

    // Set up stage branch tracking
    console.log("🔄 Setting up stage branch...");
    execSync("git checkout stage");
    execSync("git branch --set-upstream-to origin/stage stage");

    console.log(`
✅ Fork setup complete! Your repository is now configured with:
- Upstream remote pointing to ethereum-tag-service/ets
- Main branch tracking origin/main
- Stage branch tracking origin/stage

You're ready to start contributing! Remember:
- Changes to /apps/* must be PR'ed to stage
- Changes to /packages/* must be PR'ed to main
    `);
  } catch (error) {
    console.error("❌ Error setting up fork:", error);
    process.exit(1);
  }
}

setupFork();
