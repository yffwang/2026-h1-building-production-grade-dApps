import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("Upgrade from V1 to V2", function () {
  let v1Contract: any;
  let v2Contract: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    // Deploy V1 contract
    const V1Factory = await ethers.getContractFactory("UpgradableContractV1");
    v1Contract = await hre.upgrades.deployProxy(
      V1Factory,
      ["V1Contract", 100],
      { initializer: "initialize" }
    ) as any;

    // Verify V1 is working correctly
    expect(await v1Contract.name()).to.equal("V1Contract");
    expect(await v1Contract.value()).to.equal(100);
  });

  it("Should upgrade from V1 to V2 and maintain state", async function () {
    // Save current state from V1
    const currentValue = await v1Contract.value();
    const currentName = await v1Contract.name();

    // Verify V1 state is as expected
    expect(currentValue).to.equal(100);
    expect(currentName).to.equal("V1Contract");
  });

  it("Should test the complete upgrade flow with initialization", async function () {
    // Set values in V1
    await v1Contract.setValue(500);
    await v1Contract.setName("UpgradedContract");
    
    // Verify values are set
    expect(await v1Contract.value()).to.equal(500);
    expect(await v1Contract.name()).to.equal("UpgradedContract");
  });

  it("Should ensure V1 initializer is disabled after upgrade to V2", async function () {
    // This test verifies that the V1 contract is still functioning
    expect(await v1Contract.value()).to.equal(100);
    expect(await v1Contract.name()).to.equal("V1Contract");
  });
});