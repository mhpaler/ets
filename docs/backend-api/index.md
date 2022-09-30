# Backend API (contracts)

## Mumbai Testnet Addresses

The official faucet and block explorer can be found here:

- [Polygon Testnet Faucet](https://faucet.polygon.technology/)
- [Polygon Mumbai Block Explorer](https://mumbai.polygonscan.com/)

| Contract                                                                          | Address                                                                                                                         |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [ETSAccessControls](../../packages/contracts/contracts/ETSAccessControls.sol)     | [0x65d54e372fC337343F92018E88Ab90f4c7F3A40e](https://mumbai.polygonscan.com/address/0x65d54e372fC337343F92018E88Ab90f4c7F3A40e) |
| [ETSToken](../../packages/contracts/contracts/ETSToken.sol)                       | [0x03613CBE6Ec0135Cd42C5F36a8fC551198fecBff](https://mumbai.polygonscan.com/address/0x03613CBE6Ec0135Cd42C5F36a8fC551198fecBff) |
| [ETSTarget](../../packages/contracts/contracts/ETSTarget.sol)                     | [0x42C4e14903CbeA7aA2FE2DC94E4a67c912F0F8B4](https://mumbai.polygonscan.com/address/0x42C4e14903CbeA7aA2FE2DC94E4a67c912F0F8B4) |
| [ETS](../../packages/contracts/contracts/ETS.sol)                                 | [0x7EC55BFE1395e32785A67aAcc14B04e4A408F319](https://mumbai.polygonscan.com/address/0x7EC55BFE1395e32785A67aAcc14B04e4A408F319) |
| [ETSPublisherFactory](../../packages/contracts/contracts/ETSPublisherFactory.sol) | [0x7351E98b532d58821d5ab90A19254c247195d19c](https://mumbai.polygonscan.com/address/0x7351E98b532d58821d5ab90A19254c247195d19c) |

Note: The latest deployed contract addresses can also be found [here](../../packages/contracts/config/config.json).

## Contract API Documentation

Listed below are links to output from [solidity-docgen](https://github.com/OpenZeppelin/solidity-docgen) for key ETS smart contracts.

- **[ETSAccessControls](./ETSAccessControls.md)**  
  Central access control and permissioning center for ETS.

- **[ETSToken](./ETSToken.md)**  
  Contract that governs the creation & management of ETS [composable tags](../key-concepts.md#tag-ctag) (CTAGs).

- **[ETSTarget](./ETSTarget.md)**  
  Contracts that governs creation of ETS [Targets](../key-concepts.md#target).

- **[ETS](./ETS.md) (aka. "ETS Core")**  
  Central point for performing CRUD (Create, Read, Update, Delete) operations on ETS [Tagging Records](../key-concepts.md#tagging-record).

  Also contains governance functions around tagging fees as well as means for market participants to access accrued funds.

- **[ETSPublisherFactory](./ETSPublisherFactory.md)**  
  Public facing API for deploying instances of ETSPublisherV1 contracts. Caller becomes owner of instance.

- **[IETSPublisher](./publishers/interfaces/IETSPublisher.md)**  
  Base interface required for a [Publisher](../key-concepts.md#publisher-contract) contract.

- **[ETSPublisherV1](./publishers/ETSPublisherV1.md)**  
  A simple, ETS designed Publisher contract that extends base IETSPublisher with some easy to use calls into ETS Core. Can be quickly deployed via ETSPublisherFactory. See [ETSPublisherV1.sol](../../packages/contracts/contracts/publishers/ETSPublisherV1.sol)
