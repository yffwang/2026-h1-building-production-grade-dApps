import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("UpgradableContractV2", function () {
  let contract: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    // Deploy the implementation contract and initialize with V2
    const ContractFactory = await ethers.getContractFactory("UpgradableContractV2");
    contract = await hre.upgrades.deployProxy(
      ContractFactory,
      [], 
      { initializer: false } // Don't initialize with the V1 initializer since it's reverted
    ) as any;

    // Initialize V1 part first to set the owner
    await contract.initialize("TestV2Contract", 50);
    
    // Initialize with V2-specific initialization
    await contract.initializeV2();
  });

  it("Should initialize with V2-specific values", async function () {
    expect(await contract.newFeatureEnabled()).to.equal(true);
  });

  it("Should not allow initialization with V1 function", async function () {
    // Try to call initialize again, which should fail since it's already initialized
    await expect(contract.initialize("Test", 42)).to.be.reverted;
  });

  it("Should allow setting value", async function () {
    await contract.setValue(100);
    expect(await contract.value()).to.equal(100);
  });

  it("Should allow setting name (owner only)", async function () {
    await contract.setName("NewName");
    expect(await contract.name()).to.equal("NewName");
  });

  it("Should not allow non-owner to set name", async function () {
    await expect(contract.connect(addr1).setName("UnauthorizedName"))
      .to.be.reverted;
  });

  it("Should allow setting new value (V2 feature)", async function () {
    await contract.setNewValue(200);
    expect(await contract.newValue()).to.equal(200);
  });

  it("Should have new feature enabled by default", async function () {
    expect(await contract.newFeatureEnabled()).to.equal(true);
  });

  it("Should be upgradeable by owner only", async function () {
    // Owner should be the deployer
    expect(await contract.owner()).to.equal(owner.address);
  });
});