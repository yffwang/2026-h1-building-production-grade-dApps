const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MiniSwap", function () {
  let miniSwap;
  let tokenA;
  let tokenB;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    tokenA = await MockERC20.deploy("TokenA", "TKA");
    tokenB = await MockERC20.deploy("TokenB", "TKB");
    // Wait for deployment to complete
    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();

    const MiniSwap = await ethers.getContractFactory("MiniSwap");
    miniSwap = await MiniSwap.deploy();
    await miniSwap.waitForDeployment();

    // Mint tokens to owner and addr1
    await tokenA.mint(owner.address, ethers.parseEther("1000"));
    await tokenB.mint(owner.address, ethers.parseEther("1000"));
    await tokenA.mint(addr1.address, ethers.parseEther("1000"));
    await tokenB.mint(addr1.address, ethers.parseEther("1000"));

    // Approve MiniSwap
    await tokenA.approve(await miniSwap.getAddress(), ethers.MaxUint256);
    await tokenB.approve(await miniSwap.getAddress(), ethers.MaxUint256);
    await tokenA.connect(addr1).approve(await miniSwap.getAddress(), ethers.MaxUint256);
    await tokenB.connect(addr1).approve(await miniSwap.getAddress(), ethers.MaxUint256);
  });

  it("Should add liquidity", async function () {
    const amount = ethers.parseEther("100");
    await miniSwap.addLiquidity(await tokenA.getAddress(), await tokenB.getAddress(), amount);

    const liquidity = await miniSwap.getLiquidity(owner.address, await tokenA.getAddress(), await tokenB.getAddress());
    expect(liquidity).to.equal(amount);
  });

  it("Should swap tokens 1:1", async function () {
    // Owner adds liquidity
    const liquidityAmount = ethers.parseEther("100");
    await miniSwap.addLiquidity(await tokenA.getAddress(), await tokenB.getAddress(), liquidityAmount);

    // addr1 swaps 10 TokenA for TokenB
    const swapAmount = ethers.parseEther("10");
    const balanceBBefore = await tokenB.balanceOf(addr1.address);

    await miniSwap.connect(addr1).swap(await tokenA.getAddress(), await tokenB.getAddress(), swapAmount);

    const balanceBAfter = await tokenB.balanceOf(addr1.address);
    expect(balanceBAfter - balanceBBefore).to.equal(swapAmount);
  });

  it("Should remove liquidity", async function () {
    const amount = ethers.parseEther("100");
    await miniSwap.addLiquidity(await tokenA.getAddress(), await tokenB.getAddress(), amount);

    const balanceABefore = await tokenA.balanceOf(owner.address);
    const balanceBBefore = await tokenB.balanceOf(owner.address);

    await miniSwap.removeLiquidity(await tokenA.getAddress(), await tokenB.getAddress(), amount);

    const balanceAAfter = await tokenA.balanceOf(owner.address);
    const balanceBAfter = await tokenB.balanceOf(owner.address);

    expect(balanceAAfter - balanceABefore).to.equal(amount);
    expect(balanceBAfter - balanceBBefore).to.equal(amount);

    const liquidity = await miniSwap.getLiquidity(owner.address, await tokenA.getAddress(), await tokenB.getAddress());
    expect(liquidity).to.equal(0);
  });
});

