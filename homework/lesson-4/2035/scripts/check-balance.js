const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  const rpcUrl = "https://testnet-passet-hub-eth-rpc.polkadot.io";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const privateKey = process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("=".repeat(60));
  console.log("查询钱包余额 - Passet Hub 测试网");
  console.log("=".repeat(60));
  console.log("\n钱包地址:", wallet.address);

  try {
    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);

    console.log("\n💰 余额:", balanceInEth, "PAS");

    if (parseFloat(balanceInEth) > 0) {
      console.log("\n✅ 余额充足！可以开始部署合约");
    } else {
      console.log("\n❌ 余额不足！请先从 faucet 获取测试代币");
      console.log("   Faucet: https://faucet.polkadot.io/");
    }
  } catch (error) {
    console.error("\n❌ 查询失败:", error.message);
  }

  console.log("\n" + "=".repeat(60));
}

main();
