# Get a Publisher ID

If you don't know why you'd want get a Publisher ID or what happens when you create one or what you can do with it, [read this first](key-concepts.md#publisher).

## Using Polygonscan

1. Navigate to the [ETS Publisher Factory contract](https://mumbai.polygonscan.com/address/0x7F5Acb2E4a21F6387C87a054cB59a019d8f5eb7E#writeProxyContract).
2. Click the "Connect to Web3" link, the one with the red dot next to it.
3. Once connected, expand the "addPublisherV1" tab.
4. Enter `0` in the "payableAmount" field.
5. Pick a name and enter it in the `publisherName` field. Must be less than 32 characters.
6. Click "write" button and submit the transaction.

## Verify your Publisher name & address

You can verify your Publisher name and ID on our Polygon Mumbai testnet subgraph.

1. Using the link below, navigate to our subgraph which is pre-populated with a Publishers query.
2. Once there, click the play (►) arrow to run the query.

[go to ETS Polygon Mumbai subgraph](https://api.thegraph.com/subgraphs/name/ethereum-tag-service/ets-mumbai/graphql?query=query+MyQuery+%7B%0A++publishers%28first%3A+10%2C+orderBy%3A+firstSeen%2C+orderDirection%3A+desc%29+%7B%0A++++id%0A++++name%0A++++owner%0A++%7D%0A%7D)
