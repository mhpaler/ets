# Backend API

- **[IETSAccessControls](./interfaces/IETSAccessControls.md)**  
  Central access control and permissioning center for ETS.

- **[IETS Token](./interfaces/IETSToken.md)**  
  Contract that governs the creation & management of ETS [composable tags](../key-concepts.md#tag-ctag) (CTAGs).

- **[IETSTarget](./interfaces/IETSTarget.md)**  
  Contracts that governs creation of ETS [Targets](../key-concepts.md#target).

- **[ETS Core](./ETS.md)**  
  Central point for performing CRUD (Create, Read, Update, Delete) operations on [Tagging Records](../key-concepts.md#tagging-record) to the blockchain.

  It also contains some governance functions around tagging fees as well as means for market participants to access accrued funds.

- **[IETSPublisher](./publishers/interfaces/IETSPublisher.md)**  
  Base interface required for a [Publisher](../key-concepts.md#publisher-contract) contract.

- **[IETSPublisherV1](./publishers/interfaces/IETSPublisherV1.md)**  
  Interface for example publisher contract that extends base IETSPublisher with simple interactions with ETS Core.

  See. [ETSPublisher.sol](./publishers/ETSPublisherV1.md)

- **[ETSPublisherFactory](./ETSPublisherFactory.md)**  
  Public facing API for creating deploying instances of ETSPublisherV1 contracts. Caller becomes owner of instance.
