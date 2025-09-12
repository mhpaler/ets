/**
 * HD Wallet Account Management for ETS
 *
 * Implements the role-based account strategy defined in KEY-MANAGEMENT-STRATEGY.md
 * All environments use the same derivation path positions for consistency.
 *
 * Position assignments:
 * - Position 0: ETSAdmin - Contract deployment + ongoing admin functions
 * - Position 1: ETSPlatform - Platform operations, fee collection
 * - Position 2: ETSEventProcessor - Temporal workflow callbacks & event processing
 * - Position 3: ETSZora - Zora coin creation, profile-linked
 * - Position 4-7: Test accounts (User1, User2, User3, User4)
 */

// Use 'any' for WalletClient type to avoid complex viem type issues
// In practice, these are viem WalletClient objects with account, chain, etc.
export interface ETSAccounts {
  ETSAdmin: any;
  ETSPlatform: any;
  ETSEventProcessor: any;
  ETSZora: any;
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
  if (walletClients.length < 8) {
    throw new Error("Insufficient wallet clients. Need at least 8 accounts (4 operational + 4 test)");
  }

  return {
    // Operational accounts (positions 0-3)
    ETSAdmin: walletClients[0], // Position 0: Contract deployment + admin
    ETSPlatform: walletClients[1], // Position 1: Platform operations
    ETSEventProcessor: walletClients[2], // Position 2: Event processing (formerly ETSOracle)
    ETSZora: walletClients[3], // Position 3: Zora integration

    // Test accounts (positions 4-7)
    User1: walletClients[4], // Position 4: General test user
    User2: walletClients[5], // Position 5: General test user
    User3: walletClients[6], // Position 6: General test user
    User4: walletClients[7], // Position 7: General test user
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
    User1: 4,
    User2: 5,
    User3: 6,
    User4: 7,
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
  User1: "General purpose test account",
  User2: "General purpose test account",
  User3: "General purpose test account",
  User4: "General purpose test account",
} as const;
