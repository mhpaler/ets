# Key concepts

ETS is a novel framework that takes some understanding to get the most out of it. Before diving into the code, here's some of the key concepts.

## Tag

ERC-721 non-fungible token (CTAG) that stores a single tag string and origin attribution data including a Publisher address and a Creator address (see roles below).

Only one CTAG exists for a tag string regardless of its case. For example, #Punks, #punks and #PUNKS all resolve to the same CTAG.

CTAG Id is the hashed, lowercased tag string cast as a uint256.

## Target

Data structure, stored on-chain, that references/points to a URI. While a URI of any structure can be input as a Target, our indexing system, as much as possible, will restrict our interpretation & classification of URIs to the more technical parameters defined by the IETF in RFC3986. For newer protocols, such as blockchains we will lean on newer emerging URI standards such as the Blink and BIP-122

Target Id is the URI string, hashed and cast as a uint256.

## Tagging Record

Data structure, stored on-chain, that stores Tags connected to a Target by a given Tagger + Publisher combination. Also included is a recordType flag that gives taggers a means to provide context to the tagging record.

Put another way, a Tagging Record reflects “who tagged what, from where and why”.

Every Tagging record has a unique Id computed from the hashed composite of Target Id, Tagger and Publisher addresses cast as a uint256. Given this design, a Tagger that tags the same target URI with the same tags and recordType identifier via two different publishers would produce two tagging records in ETS.

Tagging Records may only be recorded in ETS Core (ETS.sol) via a whitelisted implementation of IETSTargetTagger (see Target Tagger).

ETS Core charges a per-tag micro-fee to record a Tagging Record.

## Publisher Contract

A smart contract, deployed by ETS or any third-party (dApp, platform, project implementing ETS), that calls ETS core to record Tagging Records.

Target Tagger contracts must be white-listed/authorized by ETS.

Target Tagger contracts are the “from where” of a Tagging Record and are also referred to as a Publisher in the ETS attribution chain (see roles below).

Publishers receive a portion of the revenue from the CTAGs they help generate.
