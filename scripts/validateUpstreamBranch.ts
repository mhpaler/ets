import { execSync } from "node:child_process";

function getCurrentBranch(): string {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" }).trim();
  } catch {
    console.error("❌ Error: Unable to determine the current branch.");
    process.exit(1);
  }
}

function getUpstreamOf(branch: string): string | null {
  try {
    return execSync(`git rev-parse --abbrev-ref ${branch}@{u} 2>/dev/null`, { encoding: "utf-8" }).trim();
  } catch {
    return null;
  }
}

function getChangedFiles(): string[] {
  try {
    return execSync("git diff --cached --name-only", { encoding: "utf-8" })
      .trim()
      .split("\n")
      .filter((file) => file.length > 0);
  } catch {
    console.error("❌ Error: Unable to retrieve changed files.");
    process.exit(1);
  }
}

function notifyCheckoutRules(): void {
  console.log(`
🔔 **IMPORTANT: ETS PR RULES**
- Changes to files in '/apps/*' must be PR'ed at 'stage'.
- Changes to files in '/packages/*' must be PR'ed at 'main'.

If you violate these rules, your commits will fail. Please ensure your branch upstream matches these requirements.
  `);
}

function setUpstream(branch: string, upstreamBranch: string): void {
  try {
    execSync(`git branch --set-upstream-to=origin/${upstreamBranch} ${branch}`);
    console.log(`✅ Upstream for branch "${branch}" has been set to "origin/${upstreamBranch}".`);
  } catch {
    console.error(`❌ Error: Unable to set upstream for branch "${branch}".`);
  }
}

function validateCommitRestrictions(): void {
  const branch = getCurrentBranch();
  const upstream = getUpstreamOf(branch);
  const changedFiles = getChangedFiles();

  if (!upstream) {
    console.error(
      `❌ Error: The branch "${branch}" does not have an upstream set. Please set the upstream before committing.
To set an upstream branch, use:

  git branch --set-upstream-to <remote-branch>

For example, if "main" is the intended upstream:

  git branch --set-upstream-to origin/main
      `,
    );
    process.exit(1);
  }

  const errors: string[] = [];

  for (const file of changedFiles) {
    if (file.startsWith("apps/") && upstream !== "origin/stage") {
      errors.push(`- File "${file}" in '/apps/*' requires upstream to be 'origin/stage'.`);
    } else if (file.startsWith("packages/") && upstream !== "origin/main") {
      errors.push(`- File "${file}" in '/packages/*' requires upstream to be 'origin/main'.`);
    }
  }

  if (errors.length > 0) {
    console.error(`
❌ Commit blocked due to rule violations:
${errors.join("\n")}

Please adjust your branch upstream or commit only valid changes.
    `);
    process.exit(1);
  }
}

function handlePostCheckout(): void {
  const branch = getCurrentBranch();
  const upstream = getUpstreamOf(branch);

  if (!upstream) {
    const sourceRef = execSync("git rev-parse --symbolic-full-name @{-1}", { encoding: "utf8" }).trim();
    const sourceBranch = sourceRef.replace("refs/heads/", "");

    if (sourceBranch === "stage") {
      setUpstream(branch, "stage");
    } else if (sourceBranch === "main") {
      setUpstream(branch, "main");
    } else {
      console.warn(`
⚠️ Warning: The branch "${branch}" does not have an upstream set.
You will not be able to commit until the upstream is configured.
To set the upstream manually, use:

  git branch --set-upstream-to origin/<desired-upstream-branch>
      `);
    }
  }

  notifyCheckoutRules();
}

function handlePreCommit(): void {
  validateCommitRestrictions();
}

function main(): void {
  const hookType = Bun.argv[2]; // Pass 'post-checkout' or 'pre-commit' as the argument

  switch (hookType) {
    case "post-checkout":
      handlePostCheckout();
      break;
    case "pre-commit":
      handlePreCommit();
      break;
    default:
      console.error("❌ Error: Unknown hook type. Expected 'post-checkout' or 'pre-commit'.");
      process.exit(1);
  }
}

main();
