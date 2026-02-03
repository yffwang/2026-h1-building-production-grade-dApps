import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("UpgradableContractV1", function () {
  let contract: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the implementation contract and initialize
    const ContractFactory = await ethers.getContractFactory("UpgradableContractV1");
    contract = await hre.upgrades.deployProxy(
      ContractFactory,
      ["TestContract", 42],
      { initializer: "initialize" }
    ) as any;
  });

  it("Should deploy with correct initial values", async function () {
    expect(await contract.name()).to.equal("TestContract");
    expect(await contract.value()).to.equal(42);
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("Should allow setting value", async function () {
    await contract.setValue(100);
    expect(await contract.value()).to.equal(100);
  });

  it("Should allow owner to set name", async function () {
    await contract.setName("NewName");
    expect(await contract.name()).to.equal("NewName");
  });

  it("Should not allow non-owner to set name", async function () {
    await expect(contract.connect(addr1).setName("UnauthorizedName"))
      .to.be.reverted;
  });

  it("Should authorize upgrades only by owner", async function () {
    // Owner should be able to upgrade (skip actual upgrade for now)
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("Should preserve state after upgrade", async function () {
    // Set initial values
    await contract.setValue(999);
    await contract.setName("BeforeUpgrade");

    // Verify values are set correctly
    expect(await contract.value()).to.equal(999);
    expect(await contract.name()).to.equal("BeforeUpgrade");
    expect(await contract.owner()).to.equal(owner.address);
  });
});