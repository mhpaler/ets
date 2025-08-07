#!/usr/bin/env node

/**
 * Test script to verify console statement stripping in production builds
 *
 * Usage:
 *   node test-console-stripping.js
 *
 * This script:
 * 1. Builds the app in production mode
 * 2. Searches the built files for console statements
 * 3. Reports whether console stripping worked
 */

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

console.log("🔍 Testing console statement stripping in production build...\n");

const testResults = {
  buildSuccess: false,
  consoleStatementsFound: [],
  totalFilesChecked: 0,
};

try {
  // Step 1: Build the app in production mode
  console.log("📦 Building app in production mode...");
  execSync("NODE_ENV=production pnpm build", {
    stdio: "pipe",
    cwd: process.cwd(),
  });
  testResults.buildSuccess = true;
  console.log("✅ Production build completed successfully\n");

  // Step 2: Search for console statements in built files
  console.log("🔍 Searching for console statements in built files...");
  const buildDir = path.join(process.cwd(), ".next");

  if (!fs.existsSync(buildDir)) {
    throw new Error(".next directory not found - build may have failed");
  }

  // Function to recursively search for console statements
  function searchConsoleStatements(dir, relativePath = "") {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativeFilePath = path.join(relativePath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith(".") && item !== "cache") {
        searchConsoleStatements(fullPath, relativeFilePath);
      } else if (stat.isFile() && (item.endsWith(".js") || item.endsWith(".html"))) {
        testResults.totalFilesChecked++;

        try {
          const content = fs.readFileSync(fullPath, "utf8");

          // Look for console statements from our specific test component
          const consoleTestMatches = content.match(/console\.(log|info|warn|debug)\s*\(\s*["`']ConsoleTestComponent:/g);

          if (consoleTestMatches && consoleTestMatches.length > 0) {
            testResults.consoleStatementsFound.push({
              file: relativeFilePath,
              matches: consoleTestMatches,
              context: content.substring(
                Math.max(0, content.indexOf(consoleTestMatches[0]) - 100),
                content.indexOf(consoleTestMatches[0]) + consoleTestMatches[0].length + 100,
              ),
            });
          }
        } catch (err) {
          // Skip files that can't be read
          console.log(`   ⚠️  Couldn't read ${relativeFilePath}: ${err.message}`);
        }
      }
    }
  }

  searchConsoleStatements(buildDir);

  // Step 3: Report results
  console.log(`📊 Checked ${testResults.totalFilesChecked} JavaScript/HTML files\n`);

  if (testResults.consoleStatementsFound.length === 0) {
    console.log("🎉 SUCCESS: No console statements found in production build!");
    console.log("✅ Console stripping is working correctly\n");
  } else {
    console.log("❌ FAILURE: Console statements found in production build:");
    testResults.consoleStatementsFound.forEach((result) => {
      console.log(`\n📄 File: ${result.file}`);
      console.log(`🔍 Found: ${result.matches.join(", ")}`);
      console.log(`📝 Context: ...${result.context.replace(/\s+/g, " ").trim()}...`);
    });
    console.log("\n❌ Console stripping is NOT working correctly\n");
  }

  // Provide instructions
  console.log("📋 To test manually:");
  console.log("1. Run: NODE_ENV=development pnpm dev");
  console.log("2. Open browser console and visit http://localhost:3001");
  console.log("3. You should see console messages from ConsoleTestComponent");
  console.log("\nThen:");
  console.log("4. Run: NODE_ENV=production pnpm build && pnpm start");
  console.log("5. Open browser console and visit http://localhost:3001");
  console.log("6. You should NOT see console messages from ConsoleTestComponent");
} catch (error) {
  console.error("❌ Error during test:", error.message);
  process.exit(1);
}

// Exit with appropriate code
process.exit(testResults.consoleStatementsFound.length > 0 ? 1 : 0);
