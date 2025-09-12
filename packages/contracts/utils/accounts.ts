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
 * - Position 4+: Test accounts (Buyer, RandomOne, RandomTwo, Creator, etc.)
 */

// Use 'any' for WalletClient type to avoid complex viem type issues
// In practice, these are viem WalletClient objects with account, chain, etc.
export interface ETSAccounts {
  ETSAdmin: any;
  ETSPlatform: any;
  ETSEventProcessor: any;
  ETSZora: any;
  Buyer: any;
  RandomOne: any;
  RandomTwo: any;
  Creator: any;
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
    Buyer: walletClients[4], // Position 4: Test buyer account
    RandomOne: walletClients[5], // Position 5: Test account one
    RandomTwo: walletClients[6], // Position 6: Test account two
    Creator: walletClients[7], // Position 7: Test creator account
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
    Buyer: 4,
    RandomOne: 5,
    RandomTwo: 6,
    Creator: 7,
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
  Buyer: "Test account for purchasing operations",
  RandomOne: "General purpose test account",
  RandomTwo: "General purpose test account",
  Creator: "Test account for creator operations",
} as const;
