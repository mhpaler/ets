import { createPublicClient, http } from 'viem';
import { localhost } from 'viem/chains';
import { keccak256, toBytes } from 'viem/utils';

const client = createPublicClient({
  chain: { ...localhost, id: 31337 },
  transport: http('http://localhost:8545')
});

async function getTargetId() {
  try {
    const receipt = await client.getTransactionReceipt({
      hash: '0x5000ea47191ac26924bf975bc6378ce5aaceb40bccb5ee20c9b595681b293c62'
    });

    console.log('Transaction receipt logs:');
    for (const log of receipt.logs) {
      console.log('Log:', {
        address: log.address,
        topics: log.topics,
        data: log.data
      });
    }

    // Also compute target ID the same way the test does
    const targetURI = "https://www.ethereum.org/en/developers/";
    const targetId = keccak256(toBytes(targetURI));
    console.log('\nComputed Target ID:', targetId);
    console.log('Target URI:', targetURI);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

getTargetId();