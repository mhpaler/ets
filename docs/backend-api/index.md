# Backend API (contracts)

## Mumbai Testnet Addresses

The official faucet and block explorer can be found here:

- [Polygon Testnet Faucet](https://faucet.polygon.technology/)
- [Polygon Mumbai Block Explorer](https://mumbai.polygonscan.com/)

| Contract                                                                          | Address                                                                                                                         |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [ETSAccessControls](../../packages/contracts/contracts/ETSAccessControls.sol)     | [0x3c06bD3Fc9BACA7343750981D41f51B20CA72e48](https://mumbai.polygonscan.com/address/0x3c06bD3Fc9BACA7343750981D41f51B20CA72e48) |
| [ETSToken](../../packages/contracts/contracts/ETSToken.sol)                       | [0xB454523539515b714722141031644acbD2798ef8](https://mumbai.polygonscan.com/address/0xB454523539515b714722141031644acbD2798ef8) |
| [ETSTarget](../../packages/contracts/contracts/ETSTarget.sol)                     | [0x80601DEE98762A00a74165607599368509deB7A3](https://mumbai.polygonscan.com/address/0x80601DEE98762A00a74165607599368509deB7A3) |
| [ETS](../../packages/contracts/contracts/ETS.sol)                                 | [0x83EF49d3611886BCCe50cD43B572773F169C2b1a](https://mumbai.polygonscan.com/address/0x83EF49d3611886BCCe50cD43B572773F169C2b1a) |
| [ETSPublisherFactory](../../packages/contracts/contracts/ETSPublisherFactory.sol) | [0x7F5Acb2E4a21F6387C87a054cB59a019d8f5eb7E](https://mumbai.polygonscan.com/address/0x7F5Acb2E4a21F6387C87a054cB59a019d8f5eb7E) |

Note: The latest deployed contracts can also be found [here](../../packages/contracts/config/config.json).

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
