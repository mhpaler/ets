# ETSPublisherFactory

This is the core ETS tagging contract that records TaggingRecords to the blockchain.
It also contains some governance functions around tagging fees as well as means for market
participants to access accrued funds.

## Functions

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(contract IETSAccessControls _etsAccessControls, contract IETS _ets, contract IETSToken _etsToken, contract IETSTarget _etsTarget) public
```

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address) internal
```

### addPublisherV1

```solidity
function addPublisherV1(string _publisherName) public payable
```

