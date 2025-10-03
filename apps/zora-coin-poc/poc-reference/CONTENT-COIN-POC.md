## POC: Programmatic Content Coin Creation via Zora Smart Wallet

### Background Context

#### Zora Creator Ecosystem

Zora is a decentralized creator platform where users can mint NFTs, create content, and now launch their own creator economies through coins. The platform has introduced a new economic model where:

- **Creator Profiles**: Each creator has a profile on the Zora app that serves as their identity and hub for all their content
- **Creator Coins**: Profile-level tokens that represent a creator's brand (1 billion supply, 50% vested to creator over 5 years, 50% tradeable)
- **Content Coins**: Individual coins for specific pieces of content, backed by the creator's coin (1 billion supply, 10M instant to creator, 990M tradeable)

#### The Wallet Architecture Problem

When using the Zora app, the authentication and wallet system works as follows:

1. **Authentication Layer (Privy)**: Users log in via Privy, which provides social login and creates an embedded wallet
2. **Smart Wallet Layer (Zora/Coinbase)**: Zora creates a Coinbase Smart Wallet for each user that becomes their on-chain identity
3. **Attribution Challenge**: Content coins must be created FROM the Zora smart wallet address to be properly attributed to the creator's profile

This creates a challenge: How can a creator programmatically create content coins outside the Zora app UI while maintaining proper attribution to their profile?

#### Discovery: The Dual-Owner Solution

Through blockchain investigation, we discovered that the Zora smart wallet (a Coinbase Smart Wallet implementation) has TWO owners:

- **Owner 0**: The Privy embedded wallet (controlled by social login)
- **Owner 1**: The creator's original EOA (external wallet)

Both owners can sign UserOperations to control the smart wallet through ERC-4337 Account Abstraction.

### Technical Architecture

```
┌─────────────────┐
│   Creator EOA   │──────Controls──────┐
└─────────────────┘                    │
                                        ▼
                              ┌──────────────────┐      ┌─────────────────┐
                              │ Coinbase Smart   │─────▶│  Zora Factory   │
┌─────────────────┐          │    Wallet        │      │    Contract     │
│  Privy Wallet   │──────────│  (Zora Wallet)   │      └─────────────────┘
└─────────────────┘          └──────────────────┘               │
     Owner 0                        │                           │
                                   │                           ▼
                              Creates Coins            ┌──────────────┐
                                   │                   │ Content Coin │
                                   └──────────────────▶│   Contract   │
                                                       └──────────────┘
```

### The Goal

Create a proof of concept that demonstrates:

1. **Programmatic content coin creation** without using Zora's UI
2. **Proper attribution** to the creator's Zora profile
3. **Flexibility** to use either the Privy wallet OR the original EOA as signer

This POC proves that creators can build their own tools, bots, or integrations to create content coins while maintaining their Zora identity.

### Key Addresses (Example from Investigation)

**Smart Wallet (Zora Wallet)**: `0x4de7c002be724ad63d5dca3f64126bbddb9fd735`

- This is the Coinbase Smart Wallet that represents the creator's Zora identity
- All content coins must be created with this as `msg.sender` for proper attribution

**Owner 0 (Privy Wallet)**: `0xde98c2a8182d9638f7945e17e0a0a0c94bb28c1a`

- The embedded wallet created by Privy for app authentication
- Can be exported via Privy's export feature

**Owner 1 (EOA)**: `0x147537d3bf705392a5d5f3cda8bb784e84ac9c5c`

- The creator's original Ethereum wallet
- Has direct private key access

**Infrastructure Contracts**:

- **Entry Point (ERC-4337)**: `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`
- **Zora Factory**: `0x8D47bA07Ff9ccCCF58c7E8810eE42c0Dc8B8b123`

### How It Works

1. **UserOperation Creation**: Build a UserOp that instructs the smart wallet to call Zora Factory's `deploy()` function
2. **Signing**: Sign the UserOp with EITHER the Privy wallet OR the EOA private key
3. **Bundler Submission**: Send the signed UserOp to a bundler service (Alchemy, Pimlico, etc.)
4. **Execution Flow**:
   - Bundler → Entry Point → Smart Wallet validation → Smart Wallet executes → Zora Factory creates coin
5. **Result**: New content coin created with the smart wallet as `msg.sender`, properly attributed to the creator's profile

### Implementation Strategy

The POC will demonstrate both signing paths:

1. **Path A**: Use the exported Privy private key to sign UserOperations
2. **Path B**: Use the original EOA private key to sign UserOperations

Both should successfully create content coins attributed to the same Zora profile.

### Expected Outcome

After running this POC, you should be able to:

- Create content coins programmatically from scripts/bots
- Maintain proper attribution to your Zora creator profile
- Build automated tools for content coin creation
- Integrate coin creation into external applications

This unlocks the ability to create a programmatic layer on top of Zora's creator economy while maintaining the identity and attribution system that makes creator profiles valuable.

### Step 1: Project Setup

```bash
# Create new TypeScript project
mkdir zora-coin-poc && cd zora-coin-poc
npm init -y

# Install dependencies
npm install ethers@6.10.0 viem@2.7.0
npm install @account-abstraction/contracts @account-abstraction/sdk
npm install @alchemy/aa-core @alchemy/aa-accounts @alchemy/aa-alchemy
npm install dotenv
npm install -D typescript @types/node tsx
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

### Step 2: Environment Configuration

Create `.env` file:

```bash
# Private Keys (NEVER COMMIT THIS FILE)
EOA_PRIVATE_KEY=0x... # Your EOA (0x147537...)
PRIVY_PRIVATE_KEY=0x... # Exported from Privy (0xde98c2...)

# RPC and API Keys
BASE_RPC_URL=https://base.llamarpc.com
ALCHEMY_API_KEY=your_alchemy_key # For bundler service

# Contract Addresses
SMART_WALLET_ADDRESS=0x4de7c002be724ad63d5dca3f64126bbddb9fd735
ENTRY_POINT_ADDRESS=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
ZORA_FACTORY_ADDRESS=0x8D47bA07Ff9ccCCF58c7E8810eE42c0Dc8B8b123
```

### Step 3: Core Implementation

Create `src/types.ts`:

```typescript
export interface UserOperation {
  sender: string;
  nonce: bigint;
  initCode: string;
  callData: string;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: string;
  signature: string;
}

export interface CoinDeployParams {
  payoutRecipient: string;
  owners: string[];
  uri: string;
  name: string;
  symbol: string;
  poolConfig: string;
  platformReferrer: string;
  postDeployHook: string;
  postDeployHookData: string;
  coinSalt: string;
}
```

Create `src/userOpBuilder.ts`:

```typescript
import { ethers } from 'ethers';
import { UserOperation } from './types';

export class UserOpBuilder {
  constructor(
    private provider: ethers.Provider,
    private entryPoint: string,
    private smartWallet: string
  ) {}

  async buildUserOp(callData: string): Promise<UserOperation> {
    const nonce = await this.getNonce();

    return {
      sender: this.smartWallet,
      nonce,
      initCode: '0x',
      callData,
      callGasLimit: BigInt(1000000),
      verificationGasLimit: BigInt(500000),
      preVerificationGas: BigInt(50000),
      maxFeePerGas: BigInt(30000000000), // 30 gwei
      maxPriorityFeePerGas: BigInt(2000000000), // 2 gwei
      paymasterAndData: '0x',
      signature: '0x', // Will be filled after signing
    };
  }

  private async getNonce(): Promise<bigint> {
    // Get nonce from Entry Point contract
    // Implementation depends on Entry Point interface
    return BigInt(0); // Placeholder
  }
}
```

Create `src/signer.ts`:

```typescript
import { ethers } from 'ethers';
import { UserOperation } from './types';

export class UserOpSigner {
  private wallet: ethers.Wallet;

  constructor(privateKey: string, provider: ethers.Provider) {
    this.wallet = new ethers.Wallet(privateKey, provider);
  }

  async signUserOp(userOp: UserOperation): Promise<string> {
    // Create hash of UserOp for signing
    const userOpHash = this.getUserOpHash(userOp);

    // Sign with the wallet
    const signature = await this.wallet.signMessage(
      ethers.getBytes(userOpHash)
    );

    return signature;
  }

  private getUserOpHash(userOp: UserOperation): string {
    // Implement proper UserOp hash calculation
    // This is simplified - actual implementation needs proper encoding
    const packed = ethers.solidityPacked(
      ['address', 'uint256', 'bytes', 'bytes'],
      [userOp.sender, userOp.nonce, userOp.initCode, userOp.callData]
    );
    return ethers.keccak256(packed);
  }

  getAddress(): string {
    return this.wallet.address;
  }
}
```

Create `src/coinCreator.ts`:

```typescript
import { ethers } from 'ethers';
import { CoinDeployParams } from './types';

export class CoinCreator {
  private zoraFactoryInterface: ethers.Interface;

  constructor() {
    // Zora Factory ABI (simplified - add full ABI)
    const abi = [
      'function deploy(address payoutRecipient, address[] memory owners, string memory uri, string memory name, string memory symbol, bytes memory poolConfig, address platformReferrer, address postDeployHook, bytes calldata postDeployHookData, bytes32 coinSalt) external payable returns (address coin, bytes memory)'
    ];
    this.zoraFactoryInterface = new ethers.Interface(abi);
  }

  createDeployCalldata(params: CoinDeployParams): string {
    return this.zoraFactoryInterface.encodeFunctionData('deploy', [
      params.payoutRecipient,
      params.owners,
      params.uri,
      params.name,
      params.symbol,
      params.poolConfig,
      params.platformReferrer,
      params.postDeployHook,
      params.postDeployHookData,
      params.coinSalt
    ]);
  }

  createSmartWalletCalldata(
    target: string,
    value: bigint,
    data: string
  ): string {
    // Coinbase Smart Wallet execute function
    const walletInterface = new ethers.Interface([
      'function execute(address target, uint256 value, bytes data)'
    ]);

    return walletInterface.encodeFunctionData('execute', [
      target,
      value,
      data
    ]);
  }
}
```

Create `src/main.ts`:

```typescript
import { ethers } from 'ethers';
import { config } from 'dotenv';
import { UserOpBuilder } from './userOpBuilder';
import { UserOpSigner } from './signer';
import { CoinCreator } from './coinCreator';
import { CoinDeployParams } from './types';

config();

async function main() {
  // Setup
  const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);

  // Initialize builders
  const userOpBuilder = new UserOpBuilder(
    provider,
    process.env.ENTRY_POINT_ADDRESS!,
    process.env.SMART_WALLET_ADDRESS!
  );

  const coinCreator = new CoinCreator();

  // Coin parameters (extract poolConfig from existing content coin)
  const coinParams: CoinDeployParams = {
    payoutRecipient: process.env.SMART_WALLET_ADDRESS!,
    owners: [process.env.SMART_WALLET_ADDRESS!],
    uri: 'ipfs://YOUR_METADATA_URI',
    name: 'Test Content Coin',
    symbol: 'TCC',
    poolConfig: '0x...', // Extract from existing coin
    platformReferrer: '0x0000000000000000000000000000000000000000',
    postDeployHook: '0x0000000000000000000000000000000000000000',
    postDeployHookData: '0x',
    coinSalt: ethers.randomBytes(32)
  };

  // Create deploy calldata
  const deployCalldata = coinCreator.createDeployCalldata(coinParams);

  // Wrap in smart wallet execute
  const walletCalldata = coinCreator.createSmartWalletCalldata(
    process.env.ZORA_FACTORY_ADDRESS!,
    BigInt(0),
    deployCalldata
  );

  // Build UserOp
  const userOp = await userOpBuilder.buildUserOp(walletCalldata);

  // Test with EOA signer
  console.log('Testing with EOA signer...');
  const eoaSigner = new UserOpSigner(
    process.env.EOA_PRIVATE_KEY!,
    provider
  );
  const eoaSignature = await eoaSigner.signUserOp(userOp);
  userOp.signature = eoaSignature;
  console.log('EOA Signature:', eoaSignature);

  // Test with Privy signer
  console.log('\nTesting with Privy signer...');
  const privySigner = new UserOpSigner(
    process.env.PRIVY_PRIVATE_KEY!,
    provider
  );
  const privySignature = await privySigner.signUserOp(userOp);
  userOp.signature = privySignature;
  console.log('Privy Signature:', privySignature);

  // Submit to bundler (using Alchemy or similar)
  // await submitUserOp(userOp);
}

main().catch(console.error);
```

### Step 4: Testing Sequence

1. **Test Wallet Control**

   ```bash
   # Create simple test to verify signatures
   npx tsx src/test-signature.ts
   ```

2. **Test UserOp Creation**

   ```bash
   # Test building and signing UserOps
   npx tsx src/test-userop.ts
   ```

3. **Deploy Content Coin**

   ```bash
   # Run main deployment script
   npx tsx src/main.ts
   ```

### Step 5: Integration with Bundler

For production, integrate with a bundler service:

```typescript
// src/bundler.ts
import { Client } from '@alchemy/aa-core';

export async function submitUserOp(userOp: UserOperation) {
  const client = new Client({
    chain: base,
    rpcUrl: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
  });

  const userOpHash = await client.sendUserOperation(userOp);
  const receipt = await client.waitForUserOperationReceipt(userOpHash);

  return receipt;
}
```

### Key Considerations

1. **Gas Estimation**: Start with conservative gas limits, optimize later
2. **Pool Configuration**: Extract from an existing content coin transaction to ensure valid parameters
3. **Signature Format**: Coinbase Smart Wallet expects specific signature encoding for validation
4. **Bundler Selection**: Use Alchemy, Pimlico, or Stackup for reliable UserOp submission
5. **Nonce Management**: Handle sequential UserOps carefully to avoid conflicts

### Success Criteria

- [ ] Successfully sign UserOp with EOA private key
- [ ] Successfully sign UserOp with Privy wallet private key
- [ ] Submit UserOp through bundler to Entry Point
- [ ] Create content coin with smart wallet as `msg.sender`
- [ ] Verify coin appears in Zora profile
- [ ] Confirm proper attribution on Basescan

### Troubleshooting

If signatures fail validation:

1. Check signature encoding format for Coinbase Smart Wallet
2. Verify anti-replay parameters are included in hash
3. Test with `isValidSignature` on smart wallet contract

If UserOp submission fails:

1. Check gas limits are sufficient
2. Verify nonce is correct
3. Ensure smart wallet has ETH for gas
4. Check bundler service configuration

### Next Steps

Once this POC works, you can:

1. Build automated content coin creation bots
2. Integrate with external content platforms
3. Create APIs for programmatic coin deployment
4. Build tools for batch coin creation
5. Implement custom business logic around coin creation

This proves that creators can maintain their Zora identity while building custom tooling outside of Zora's UI constraints.
