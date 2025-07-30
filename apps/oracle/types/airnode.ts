/**
 * Type definitions for Airnode-related data structures
 */

/**
 * Credentials for an Airnode, including its address and extended public key
 */
export interface AirnodeCredentials {
  /** The Airnode's Ethereum address derived from its mnemonic */
  airnodeAddress: string;

  /** The Airnode's extended public key used for deriving sponsor wallets */
  airnodeXpub: string;

  /** Whether the mnemonic was newly generated or loaded from environment */
  isNewMnemonic: boolean;

  /** The mnemonic seed phrase (stored for deployment) */
  mnemonic?: string;

  /** The environment (staging or production) */
  environment?: string;
}

/**
 * Information about a sponsorship relationship
 */
export interface SponsorshipInfo {
  /** The address of the sponsor (typically the admin wallet) */
  sponsorAddress: string;

  /** The derived sponsor wallet address used by the Airnode for fulfillment */
  sponsorWalletAddress: string;

  /** The Airnode's Ethereum address */
  airnodeAddress: string;

  /** The Airnode's extended public key */
  airnodeXpub: string;

  /** The endpoint ID for the API endpoint */
  endpointId: string;

  /** The address of the requester contract */
  requesterAddress: string;

  /** The environment (staging or production) */
  environment?: string;
}
