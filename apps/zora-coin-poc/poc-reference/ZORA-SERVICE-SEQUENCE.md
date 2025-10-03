# ZoraService Call Stack Sequence Diagram

## TAG Coin Creation Flow

```mermaid
sequenceDiagram
    participant Client as Test Client<br/>(test-api-baby-steps.ts)
    participant API as Express API<br/>(offchain-api)
    participant Routes as TagCoin Routes<br/>(tagCoinRoutes.ts)
    participant Controller as TagCoin Controller<br/>(tagCoinController.ts)
    participant ZoraService as ZoraService<br/>(zoraService.ts)
    participant MetadataAPI as Metadata API<br/>(internal)
    participant ZoraSDK as Zora SDK<br/>(@zoralabs/coins-sdk)
    participant Blockchain as Base Sepolia<br/>(Chain ID 84532)

    Note over Client,Blockchain: TAG Coin Creation Request Flow

    Client->>API: POST /api/tag-coin/create
    Note right of Client: Body: { tagData, chainId: 84532, dryRun: false }
    
    API->>Routes: Route to /api/tag-coin/*
    Routes->>Controller: tagCoinController.createTagCoin(req, res)
    
    Note over Controller: Validate request body<br/>Extract tagData & chainId
    
    Controller->>ZoraService: zoraService.createCoin(eventData)
    Note right of Controller: eventData contains:<br/>- originalInput: "#ZoraTest123"<br/>- creator: 0x4de7c002...<br/>- relayer: 0x4de7c002...
    
    activate ZoraService
    Note over ZoraService: Check if localhost mode<br/>(returns mock for chainId 31337)
    
    ZoraService->>ZoraService: coinExists(eventData)
    Note right of ZoraService: Check if coin already deployed<br/>at predicted address
    
    ZoraService->>MetadataAPI: generateMetadata(eventData)
    Note right of ZoraService: POST /api/metadata/generate<br/>with x-api-key header
    
    MetadataAPI-->>ZoraService: { success: true, metadataUri: "ipfs://..." }
    
    Note over ZoraService: Create fresh viem clients<br/>with Base Sepolia chain
    
    ZoraService->>ZoraService: Create fresh publicClient & walletClient
    Note right of ZoraService: Chain: Base Sepolia (84532)<br/>RPC: https://sepolia.base.org<br/>Account: ETS_EOA_PRIVATE_KEY
    
    ZoraService->>ZoraSDK: createCoin({ call: args, walletClient, publicClient })
    Note right of ZoraService: args = {<br/>  creator: eventData.creator,<br/>  name: "TAG: Zoratest123",<br/>  symbol: "ETS",<br/>  metadata: { type: "RAW_URI", uri },<br/>  currency: ZORA,<br/>  chainId: 84532,<br/>  startingMarketCap: LOW,<br/>  platformReferrerAddress: relayer<br/>}
    
    activate ZoraSDK
    ZoraSDK->>ZoraSDK: validateClientNetwork(publicClient)
    Note right of ZoraSDK: Check publicClient.chain.id<br/>Must be 8453 (base) or 84532 (baseSepolia)
    
    alt Chain validation passes
        ZoraSDK->>ZoraSDK: createCoinCall(call)
        ZoraSDK->>Blockchain: publicClient.simulateContract()
        Blockchain-->>ZoraSDK: simulation result
        ZoraSDK->>Blockchain: walletClient.writeContract()
        Blockchain-->>ZoraSDK: transaction hash
        ZoraSDK->>Blockchain: publicClient.waitForTransactionReceipt()
        Blockchain-->>ZoraSDK: transaction receipt
        ZoraSDK-->>ZoraService: { hash, address, deployment }
    else Chain validation fails
        ZoraSDK-->>ZoraService: Error: "Client network needs to be base or baseSepolia"
    end
    deactivate ZoraSDK
    
    alt Success
        ZoraService-->>Controller: { success: true, coinAddress, transactionHash }
    else Error
        ZoraService-->>Controller: { success: false, error }
    end
    deactivate ZoraService
    
    Controller-->>Routes: JSON response
    Routes-->>API: HTTP response
    API-->>Client: 201 Created or 500 Error

    Note over Client,Blockchain: Current Issue: SDK validation fails<br/>despite correct chain configuration
```

## Key Components

### 1. **ZoraService Initialization** (constructor)
- **Chain Selection**: `chainId === 84532 ? baseSepolia : base`
- **Client Creation**: Creates `publicClient` and `walletClient` with RPC URLs
- **Account Setup**: Uses `ETS_EOA_PRIVATE_KEY` for transactions

### 2. **ZoraService.createCoin()** Method Flow
1. **Localhost Check**: Returns mock data for `chainId === 31337`
2. **Existence Check**: Calls `coinExists()` to check if coin already deployed
3. **Metadata Generation**: Calls internal metadata API
4. **Fresh Client Creation**: Creates new viem clients (debugging step)
5. **SDK Call**: Calls Zora SDK with proper parameters

### 3. **Current Problem Location**
The issue occurs at the **SDK validation step**:
- Our `publicClient.chain.id = 84532` ✅
- Our manual validation `84532 === baseSepolia.id` returns `true` ✅  
- But SDK's `validateClientNetwork()` still throws error ❌

### 4. **Recent Fixes Applied**
- ✅ Fixed RPC URL configuration (`https://sepolia.base.org`)
- ✅ Fixed SDK function signature (using `{ call, walletClient, publicClient }`)
- ✅ Fixed parameter structure (wrapped in `call` object)
- ✅ Fixed currency constant (`CreateConstants.ContentCoinCurrencies.ZORA`)
- ✅ Fixed TypeScript imports (removed invalid `ValidMetadataURI`)

### 5. **Environment Configuration**
- **Chain ID**: 84532 (Base Sepolia)
- **RPC URL**: `https://sepolia.base.org`
- **Private Key**: `ETS_EOA_PRIVATE_KEY` environment variable
- **API Mode**: `NODE_ENV=production` (not development/localhost)