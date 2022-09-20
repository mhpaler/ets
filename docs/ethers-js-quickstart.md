# Ethers.js quickstart

This guide walks through adding a [Publisher](./key-concepts.md#publisher) to ETS (required), creating a [CTAG](./key-concepts.md#tag-ctag), creating a [Tagging Record](./key-concepts.md#tagging-record) and modifying a Tagging Record. We'll be using set of custom [Hardhat](https://hardhat.org/) Tasks that use [Ethers.js](https://docs.ethers.io/v5/) to interact with the protocol.

If you are interested in contract-to-contract interaction, please see the [Contract-to-contract quickstart](./docs/contract-to-contract-quickstart.md).

## Setup

Our Hardhat Tasks can execute directly on the Polygon Mumbai testnet or on [ETS deployed to local hardhat network](./docs/local-dev-quickstart.md). This guide covers running on Polygon Mumbai, but all commands are the same when running locally, except the `--network` flag is set to `localhost`.

For either method, you'll first need to clone the ETS repository and install ETS.

```zsh
# clone the repo directly
git clone https://github.com/ethereum-tag-service/ets.git
cd ets

pnpm install
```

Next, make sure you have a [Metamask wallet](https://blog.thirdweb.com/guides/create-a-metamask-wallet/), the secret recovery phrase for that wallet, and [some test Matic](https://blog.thirdweb.com/guides/get-matic-on-polygon-mumbai-testnet-faucet/) in one or more of the first 6 accounts.

Finally, from the root of ETS, make a copy of `example.env`, save as `.env` and add your secret recovery phrase to `MNEMONIC_MUMBAI` and a free [Alchemy API](https://www.alchemy.com/) key for Polygon Mumbai to `ALCHEMY_MUMBAI`.

## Check accounts and balances

Before interacting with ETS on Polygon Mumbai, you'll want to confirm that the accounts and test Matic amounts match that of your Metamask. For example:

```zsh
$ hardhat accounts --network mumbai

account0: 0x93A5f58566D436Cae0711ED4d2815B85A26924e6 Balance: 1.653168035626479011
account1: 0xE9FBC1a1925F6f117211C59b89A55b576182e1e9 Balance: 0.438160535492833465
account2: 0x60F2760f0D99330A555c5fc350099b634971C6Eb Balance: 1.408666583344570904
account3: 0xcF38E38DA8C9921f39DC8E9327Bc03bA514D4C37 Balance: 3.34470009028310787
account4: 0xE2d53594A3C7Fdf1CA86D8e957C275b72e34DA06 Balance: 0.0
account5: 0xdF0eB27bCc26E639137899d63B5221DABd2355f2 Balance: 0.0
```

## Create a Publisher

```zsh
$ hardhat addPublisher --name "Solana" --network mumbai --signer "account2"

started txn 0x10d14f87fbab80b7f372256f1a1164c4d5283335b48168cd90ea262a4cb1d0ec
New publisher contract deployed at 0xb16170ed1a08EE57d18d41C204dCde3c6C9d2D1a by account2
```

Note that publisher names can not be duplicated:

```zsh
$ hardhat addPublisher --name "Solana" --network mumbai --signer "account2"
Publisher name exists
```

and that the signer `"account2"` becomes the Publisher Owner.

You can check that the Publisher was created with the correct credentials by running the following command in [our subgraph](https://api.thegraph.com/subgraphs/name/ethereum-tag-service/ets-mumbai/graphql).

```graphql
query Publishers {
  publishers(first: 1, orderBy: firstSeen, orderDirection: desc) {
    id
    name
    owner
  }
}
```

```json
# output
{
  "data": {
    "publishers": [
      {
        "id": "0xb16170ed1a08ee57d18d41c204dcde3c6c9d2d1a",
        "name": "Solana",
        "owner": "0x60f2760f0d99330a555c5fc350099b634971c6eb"
      }
    ]
  }
}
```

Learn more about [Publishers](./key-concepts.md#publisher). View the [addPublisher](../packages/contracts/tasks/addPublisher.js) Hardhat Task.

## Create CTAGs

Next, we'll create two CTAGs using the Publisher contract deployed in the previous step, and sign the transaction with a different account (`account3`).

```zsh
$ hardhat createTags --publisher "Solana" --signer "account3" --tags "#Phantom, #FamilySol" --network mumbai

Minting CTAGs "#Phantom,#FamilySol"
"#Phantom" minted by account3 with id 2534166372342226846419692081870028406351230466705393079417605661637489732040
"#FamilySol" minted by account3 with id 53310349790028376771296848103922679878406746938593754136048816181764772325808
```

There are a number of ways to get at the data. Here's one:

```graphql
query Tags {
  tags(where: { display_in: ["#Phantom", "#FamilySol"] }) {
    display
    publisher {
      name
      id
    }
    creator {
      id
    }
  }
}
```

```json
# output
{
  "data": {
    "tags": [
      {
        "display": "#Phantom",
        "publisher": {
          "name": "Solana",
          "id": "0xb16170ed1a08ee57d18d41c204dcde3c6c9d2d1a"
        },
        "creator": {
          "id": "0xcf38e38da8c9921f39dc8e9327bc03ba514d4c37"
        }
      },
      {
        "display": "#FamilySol",
        "publisher": {
          "name": "Solana",
          "id": "0xb16170ed1a08ee57d18d41c204dcde3c6c9d2d1a"
        },
        "creator": {
          "id": "0xcf38e38da8c9921f39dc8e9327bc03ba514d4c37"
        }
      }
    ]
  }
}

```

## Create a Tagging Record

Next, we'll be tagging an [NFT](https://etherscan.io/nft/0xC36442b4a4522E871399CD717aBDD847Ab11FE88/318669) with some tags. In case you didn't click the link, it's a Uniswap V3 LP Position containing APE & WETH.

For tags, we'll use #Uniswap, #APE, #WETH, #APE/WETH

For the [target URI](./key-concepts.md#target), we could use the Etherscan link above. However, for the for the purposes of this demo, we'll use a Blink for the NFT URI.

If you are unfamiliar with [Blinks](https://w3c-ccg.github.io/blockchain-links/), they are a W3C RFC URI schema for blockchain based data. Blinks provide ETS a standardized way to know about the blockchain targets being tagged, especially during the indexing process.

```zsh
$ hardhat applyTags --publisher "Solana" --signer "account3" --tags "#Uniswap, #APE, #WETH, #APE/WETH" --uri "blink:ethereum:mainnet:0xC36442b4a4522E871399CD717aBDD847Ab11FE88:318669" --record-type "bookmark" --network mumbai

started txn 0xdbc7809ed849167e19798930202151259123dfb5b089054230f2a13aad1b9f53
New tagging record created with 4 tag(s) and id: 108496552797381919177769037368004847463135908918745565862845053892120713010827
account3 charged for 4 tags
```

Lets have a look at the tagging record in the index.

```graphql
query TaggingRecord {
  taggingRecords(where: { publisher_: { name: "Solana" } }) {
    timestamp
    tags {
      display
    }
    recordType
    target {
      targetURI
      targetType
      targetTypeKeywords
    }
  }
}
```

```json
# output
{
  "data": {
    "taggingRecords": [
      {
        "id": "108496552797381919177769037368004847463135908918745565862845053892120713010827",
        "timestamp": "1663648880",
        "tags": [
          {
            "display": "#Uniswap"
          },
          {
            "display": "#WETH"
          },
          {
            "display": "#APE"
          },
          {
            "display": "#APE/WETH"
          }
        ],
        "recordType": "bookmark",
        "target": {
          "targetURI": "blink:ethereum:mainnet:0xC36442b4a4522E871399CD717aBDD847Ab11FE88:318669",
          "targetType": "BLINK",
          "targetTypeKeywords": [
            "Blink",
            "ethereum",
            "mainnet",
            "0xC36442b4a4522E871399CD717aBDD847Ab11FE88:318669",
            "UNKNOWN",
            "UNKNOWN"
          ]
        }
      }
    ]
  }
}
```

## Appending tags

Todo

## Removing tags

Todo

## Replacing tags

Todo
