# ETS Oracle

The "ETS Oracle" is a catchall term to describe the off-chain processes that support ETS.

ETS Oracle relies heavily on [Open Zeppelin Defender](https://www.openzeppelin.com/defender). Defender was chosen for it's best in class security practices and development tooling.

As ETS matures, whenever possible, we will move towards using more decentralized infrastructure.

## Oracle Processes

### Enrich Target

Coming soon. Details can be found inside [ETSEnrichTarget.sol](https://github.com/ethereum-tag-service/ets/blob/stage/packages/contracts/contracts/ETSEnrichTarget.sol).

### Release Next Auction

By design, ETS places strict controls on the number of concurrent tag auctions (currently one per auctioneer) as well as the order in which tags are released for auction.

Based on a modified version of the [Nouns auction](https://nouns.wtf/), the ETS Tag auction is handled 100% on-chain. However, process of selecting and releasing the next tag for auction requires off-chain processing. This is handled by the **Release Next Auction** process.

From a high-level, the process operates as follows:

1. An auction ends. No more bids are permitted because current `blocktime` is greater than or equal to the auction `end_time`.
2. Someone executes the public `ETSAuctionHouse.settleAuction(uint256 _auctionId)` function. This is an an on-chain transaction that transfers the tag to it's new owner, distributes the auction proceeds, and emits an `AuctionSettled` event.
3. Our custom [Defender Monitor](https://docs.openzeppelin.com/defender/v2/module/monitor) is listening for `AuctionSettled` events.
4. When the Monitor picks up the event, it triggers our custom [Defender Action](https://docs.openzeppelin.com/defender/v2/module/actions) called `ReleaseNextAuction`.
5. Our `ReleaseNextAuction` Action makes use of our ETS Graph to find the `tokenId` for the oldest tag with the highest use count. Selection logic is described below.
6. With the `tokenId`, our Action uses our custom [Defender Relayer](https://docs.openzeppelin.com/defender/v2/manage/relayers) to call back onchain the `ETSAuctionHouse.fulfillRequestCreateAuction(uint256 _tokenId)` function, which "releases" the tag. Once released, the token is open for bidding.
7. Once a bid is cast, the auction begins and the cycle continues.

#### Release Ordering Logic

The logic for selecting the next tag to be auctioned is as follows:

1. Retrieve all tags owned by the ETS Platform, excluding the last auctioned tag. (New tags are owned by ETS Platform by default)
2. Filter the tags to include only those with a positive "tagAppliedInTaggingRecord" count.
3. If there are no tags with a positive "tagAppliedInTaggingRecord" count, select the oldest tag.
4. If there are tags with a positive "tagAppliedInTaggingRecord" count, select the tag with the highest count.
5. If there are multiple tags with an equal high "tagAppliedInTaggingRecord" count, select the oldest tag among them.

```bash
# Defender Dependency Version: v2023-11-22
Node version: v16.20.2
@openzeppelin/defender-sdk: 1.5.0
@datadog/datadog-api-client: 1.18.0
@gnosis.pm/safe-core-sdk: 0.3.1
@gnosis.pm/safe-ethers-adapters: 0.1.0-alpha.13
axios: 1.6.1
axios-retry: 3.5.0
@openzeppelin/defender-admin-client: 1.52.0
@openzeppelin/defender-autotask-client: 1.52.0
@openzeppelin/defender-autotask-utils: 1.52.0
@openzeppelin/defender-kvstore-client: 1.52.0
@openzeppelin/defender-relay-client: 1.52.0
@openzeppelin/defender-sentinel-client: 1.52.0
ethers: 5.5.3
fireblocks-sdk: 2.5.4
graphql: 15.8.0
graphql-request: 3.4.0
web3: 1.9.0
```

```bash
# Defender Dependency Version: v2024-01-18
Node version: v16.20.2
@openzeppelin/defender-sdk: 1.5.0
@datadog/datadog-api-client: 1.18.0
@gnosis.pm/safe-core-sdk: 0.3.1
@gnosis.pm/safe-ethers-adapters: 0.1.0-alpha.13
axios: 1.6.1
axios-retry: 3.5.0
@openzeppelin/defender-admin-client: 1.52.0
@openzeppelin/defender-autotask-client: 1.52.0
@openzeppelin/defender-autotask-utils: 1.52.0
@openzeppelin/defender-kvstore-client: 1.52.0
@openzeppelin/defender-relay-client: 1.52.0
@openzeppelin/defender-sentinel-client: 1.52.0
ethers: 5.5.3
fireblocks-sdk: 2.5.4
graphql: 15.8.0
graphql-request: 3.4.0
web3: 1.9.0
```
