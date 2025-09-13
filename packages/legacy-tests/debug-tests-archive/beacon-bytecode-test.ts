import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { loadIgnitionFixture } from "./fixtures/ignitionFixture.js";

describe("Beacon and Proxy Bytecode Verification", async () => {
  const fixture = await loadIgnitionFixture();
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  it("should verify factory has bytecode", async () => {
    const factoryCode = await publicClient.getCode({
      address: fixture.contracts.ETSRelayerFactory.address,
    });
    console.log("Factory address:", fixture.contracts.ETSRelayerFactory.address);
    console.log("Factory bytecode length:", factoryCode?.length || 0);
    assert.ok(factoryCode && factoryCode.length > 0, "Factory should have bytecode");
  });

  it("should verify beacon has bytecode", async () => {
    // Get beacon address from factory
    const beaconAddress = await fixture.contracts.ETSRelayerFactory.read.getBeacon();
    console.log("Beacon address:", beaconAddress);

    const beaconCode = await publicClient.getCode({
      address: beaconAddress,
    });
    console.log("Beacon bytecode length:", beaconCode?.length || 0);
    assert.ok(beaconCode && beaconCode.length > 0, "Beacon should have bytecode");
  });

  it("should verify relayer proxy has bytecode", async () => {
    const relayerAddress = fixture.contracts.ETSRelayer.address;
    console.log("ETSRelayer proxy address:", relayerAddress);

    const relayerCode = await publicClient.getCode({
      address: relayerAddress,
    });
    console.log("Relayer proxy bytecode length:", relayerCode?.length || 0);
    assert.ok(relayerCode && relayerCode.length > 0, "Relayer proxy should have bytecode");
  });

  it("should verify relayer implementation has bytecode", async () => {
    const implAddress = fixture.contracts.ETSRelayerImplementation.address;
    console.log("Relayer implementation address:", implAddress);

    const implCode = await publicClient.getCode({
      address: implAddress,
    });
    console.log("Relayer implementation bytecode length:", implCode?.length || 0);
    assert.ok(implCode && implCode.length > 0, "Implementation should have bytecode");
  });

  it("should test ETH transfer to relayer", async () => {
    const [sender] = await viem.getWalletClients();

    // Check balances before
    const relayerBalanceBefore = await publicClient.getBalance({
      address: fixture.contracts.ETSRelayer.address,
    });
    const etsBalanceBefore = await publicClient.getBalance({
      address: fixture.contracts.ETS.address,
    });

    console.log("Before transfer - Relayer balance:", relayerBalanceBefore);
    console.log("Before transfer - ETS balance:", etsBalanceBefore);

    // Try to send ETH directly to the relayer
    const hash = await sender.sendTransaction({
      to: fixture.contracts.ETSRelayer.address,
      value: 1000000000000000000n, // 1 ETH
    });

    await publicClient.waitForTransactionReceipt({ hash });

    // Check balances after
    const relayerBalanceAfter = await publicClient.getBalance({
      address: fixture.contracts.ETSRelayer.address,
    });
    const etsBalanceAfter = await publicClient.getBalance({
      address: fixture.contracts.ETS.address,
    });

    console.log("After transfer - Relayer balance:", relayerBalanceAfter);
    console.log("After transfer - ETS balance:", etsBalanceAfter);

    const relayerIncrease = relayerBalanceAfter - relayerBalanceBefore;
    console.log("Relayer balance increase:", relayerIncrease);

    assert.equal(relayerIncrease, 1000000000000000000n, "Relayer should receive 1 ETH");
  });
});
