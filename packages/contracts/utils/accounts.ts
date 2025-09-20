/**
 * HD Wallet Account Management for ETS
 *
 * Implements the role-based account strategy defined in KEY-MANAGEMENT-STRATEGY.md
 * All environments use the same derivation path positions for consistency.
 *
 * Position assignments:
 * - Positions 0-9: RESERVED for ETS operational roles
 *   - Position 0: ETSAdmin - Contract deployment + ongoing admin functions
 *   - Position 1: ETSPlatform - Platform operations, fee collection
 *   - Position 2: ETSEventProcessor - Event processing and workflow callbacks
 *   - Position 3: ETSZora - Zora coin creation, profile-linked
 *   - Positions 4-9: Reserved for future ETS operational roles
 * - Positions 10+: Test accounts (User1, User2, User3, User4, etc.)
 */

// Use 'any' for WalletClient type to avoid complex viem type issues
// In practice, these are viem WalletClient objects with account, chain, etc.
export interface ETSAccounts {
  // Operational accounts (positions 0-3)
  ETSAdmin: any;
  ETSPlatform: any;
  ETSEventProcessor: any;
  ETSZora: any;
  // Reserved for future operational accounts (positions 4-9)
  ETSReserved4?: any;
  ETSReserved5?: any;
  ETSReserved6?: any;
  ETSReserved7?: any;
  ETSReserved8?: any;
  ETSReserved9?: any;
  // Test accounts (positions 10+)
  User1: any;
  User2: any;
  User3: any;
  User4: any;
}

/**
 * Get standardized ETS accounts from wallet clients
 * @param walletClients Array of wallet clients from viem.getWalletClients()
 * @returns Mapped accounts object with role-based naming
 */
export function getETSAccounts(walletClients: any[]): ETSAccounts {
  if (walletClients.length < 14) {
    throw new Error("Insufficient wallet clients. Need at least 14 accounts (10 reserved + 4 test)");
  }

  return {
    // Active operational accounts (positions 0-3)
    ETSAdmin: walletClients[0], // Position 0: Contract deployment + admin
    ETSPlatform: walletClients[1], // Position 1: Platform operations
    ETSEventProcessor: walletClients[2], // Position 2: Event processing
    ETSZora: walletClients[3], // Position 3: Zora integration

    // Reserved operational slots (positions 4-9)
    // These are intentionally not included in the default return
    // to avoid breaking existing code. Uncomment as needed:
    // ETSReserved4: walletClients[4], // Future: ETSTreasury?
    // ETSReserved5: walletClients[5], // Future: ETSGovernance?
    // ETSReserved6: walletClients[6], // Future: ETSRelayerOperator?
    // ETSReserved7: walletClients[7], // Future: ETSUpgrader?
    // ETSReserved8: walletClients[8], // Future: ETSAuditor?
    // ETSReserved9: walletClients[9], // Future: ETSDataProvider?

    // Test accounts (positions 10-13)
    User1: walletClients[10], // Position 10: General test user
    User2: walletClients[11], // Position 11: General test user
    User3: walletClients[12], // Position 12: General test user
    User4: walletClients[13], // Position 13: General test user
  };
}

/**
 * Get account position for a given role
 * @param role The role name
 * @returns The HD wallet position for that role
 */
export function getAccountPosition(role: keyof ETSAccounts): number {
  const positions: Record<keyof ETSAccounts, number> = {
    ETSAdmin: 0,
    ETSPlatform: 1,
    ETSEventProcessor: 2,
    ETSZora: 3,
    ETSReserved4: 4,
    ETSReserved5: 5,
    ETSReserved6: 6,
    ETSReserved7: 7,
    ETSReserved8: 8,
    ETSReserved9: 9,
    User1: 10,
    User2: 11,
    User3: 12,
    User4: 13,
  };

  return positions[role];
}

/**
 * Role descriptions for documentation
 */
export const ROLE_DESCRIPTIONS = {
  ETSAdmin: "Contract deployment and ongoing administration",
  ETSPlatform: "Platform operations and fee management",
  ETSEventProcessor: "Automated event processing and workflow callbacks",
  ETSZora: "Zora protocol integration and coin creation",
  ETSReserved4: "Reserved for future operational role",
  ETSReserved5: "Reserved for future operational role",
  ETSReserved6: "Reserved for future operational role",
  ETSReserved7: "Reserved for future operational role",
  ETSReserved8: "Reserved for future operational role",
  ETSReserved9: "Reserved for future operational role",
  User1: "General purpose test account",
  User2: "General purpose test account",
  User3: "General purpose test account",
  User4: "General purpose test account",
} as const;

/**
 * Suggested future role assignments (for documentation purposes)
 *
 * Position 4: ETSTreasury - Treasury management and financial operations
 * Position 5: ETSGovernance - Governance proposal execution
 * Position 6: ETSRelayerOperator - Automated relayer operations
 * Position 7: ETSUpgrader - Contract upgrade operations
 * Position 8: ETSAuditor - Audit and compliance operations
 * Position 9: ETSDataProvider - External data provider operations
 */
