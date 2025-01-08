# ETSRelayerFactory

## Functions

### constructor

```solidity
constructor(address _etsRelayerLogic, contract IETSAccessControls _etsAccessControls, contract IETS _ets, contract IETSToken _etsToken, contract IETSTarget _etsTarget) public
```

### addRelayer

```solidity
function addRelayer(string _relayerName) external returns (address relayer)
```

### getImplementation

```solidity
function getImplementation() public view returns (address)
```

### getBeacon

```solidity
function getBeacon() public view returns (address)
```

