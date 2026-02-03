import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { hexToBigInt, toHex } from "viem";

describe("Storage", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  const slot0 = toHex(0, { size: 32 });

  it("initial storedNumber is 0", async function () {
    const storage = await viem.deployContract("Storage");
    const valueHex = await publicClient.getStorageAt({
      address: storage.address,
      slot: slot0,
    });
    assert.equal(hexToBigInt(valueHex as `0x${string}`), 0n);
  });

  it("emits NumberStored on setNumber", async function () {
    const storage = await viem.deployContract("Storage");
    await viem.assertions.emitWithArgs(
      storage.write.setNumber([42n]),
      storage,
      "NumberStored",
      [42n],
    );
  });

  it("updates storage slot 0 when setNumber is called", async function () {
    const storage = await viem.deployContract("Storage");

    await storage.write.setNumber([123n]);
    let valueHex = await publicClient.getStorageAt({
      address: storage.address,
      slot: slot0,
    });
    assert.equal(hexToBigInt(valueHex as `0x${string}`), 123n);

    await storage.write.setNumber([456n]);
    valueHex = await publicClient.getStorageAt({
      address: storage.address,
      slot: slot0,
    });
    assert.equal(hexToBigInt(valueHex as `0x${string}`), 456n);
  });

  it("handles large uint256 values", async function () {
    const storage = await viem.deployContract("Storage");
    const large = 1234567890123456789012345678901234567890n;
    await storage.write.setNumber([large]);
    const valueHex = await publicClient.getStorageAt({
      address: storage.address,
      slot: slot0,
    });
    assert.equal(hexToBigInt(valueHex as `0x${string}`), large);
  });
});

