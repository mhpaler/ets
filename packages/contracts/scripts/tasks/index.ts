// TypeScript Tasks - Modern ETS with Zora TAG Coin Framework
// All tasks updated for viem, address-based architecture, and Event Processor integration

// Core account and network utilities
import "./accounts";

// Relayer management
import "./add-relayer";
import "./check-relayer";
import "./transfer-relayer";
import "./toggle-pause-relayer";

// TAG operations (Zora coin integration)
import "./create-tags";

// Target operations (for testing enrichment pipeline)
import "./create-target";

// Tagging operations (address-based TAG architecture)
import "./apply-tags";
import "./remove-tags";
import "./replace-tags";

// Deployment and debugging
import "./deploy-ets";

// Legacy JavaScript tasks (TODO: Convert remaining if needed)
// These are imported but should be converted to TypeScript eventually:

// Utility tasks that might still be useful
// import "./miningSettings"; // Blockchain mining configuration
// import "./createTestData"; // Test data generation
// import "./debugContract"; // Contract debugging utilities

// Note: Airnode-related tasks have been removed:
// - checkAirnodeParams.js (removed - obsolete)
// - enrichTarget.js (removed - replaced by Event Processor)
// - enrichTargetDirect.js (removed - replaced by Event Processor)

// Note: Legacy deployment removed:
// - deployETS.js.old (removed - replaced by deploy-ets.ts)

// Task loading is complete - use 'hardhat --help' to see available tasks
