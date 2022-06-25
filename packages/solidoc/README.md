# ETS Solidity Documentation Generator

This package is a work-around for ETS to use the lovely Solidity documentation
generator called Solidoc.

This package uses a fork by [Statechannels](https://github.com/statechannels/solidoc) of the original
Solidoc from [CYBRToken](https://github.com/CYBRToken/solidoc).

## Usage

To generate Solidity documentation, cd into the solidoc package and run

```bash
pnpm docgen
```

This will output Solidity documentation to a folder configured in `solidoc.json`

## Rationale

Until Solidoc can support ^0.8.0 Hardhat projects out of box, this is the
quickest work-around to get the lovely output of Solidoc.
