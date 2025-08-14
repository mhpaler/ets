#!/usr/bin/env ts-node

import { TagCoinHandler } from './handlers/tagCoinHandler';
import { config } from './config';

// Mock TagCreated event data
const mockTagCreatedEvent = {
  coinAddress: '0x1234567890123456789012345678901234567890',
  originalInput: '#TestTag',
  displayVersion: '#TestTag',
  machineName: 'testtag',
  creator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  relayer: '0xfedcbafedcbafedcbafedcbafedcbafedcbafed',
  timestamp: BigInt(Date.now()),
  blockNumber: 12345n,
  transactionHash: '0x9876543210987654321098765432109876543210987654321098765432109876',
};

// Mock log structure
const mockLog = {
  args: mockTagCreatedEvent,
  blockNumber: mockTagCreatedEvent.blockNumber,
  transactionHash: mockTagCreatedEvent.transactionHash,
} as any;

async function testEventProcessor() {
  console.log('🧪 Testing Event Processor in isolation...');
  console.log(`Environment: ${config.environment}`);
  console.log(`ETS Token Address: ${config.etsTokenAddress}`);
  console.log(`Off-chain API URL: ${config.offchainApiUrl}\n`);

  const handler = new TagCoinHandler();

  try {
    console.log('📝 Processing mock TagCreated event...');
    await handler.handleTagCreatedLogs([mockLog]);
    console.log('✅ Event processing completed successfully!');
  } catch (error) {
    console.error('❌ Event processing failed:', error);
    process.exit(1);
  }
}

// Run the test
testEventProcessor().catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});