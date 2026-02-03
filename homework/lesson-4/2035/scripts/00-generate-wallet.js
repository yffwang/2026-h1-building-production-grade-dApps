const { ethers } = require("ethers");

// 生成新钱包
const wallet = ethers.Wallet.createRandom();

console.log("=".repeat(60));
console.log("🔐 新生成的测试钱包（仅用于测试网！）");
console.log("=".repeat(60));
console.log("\n地址:", wallet.address);
console.log("\n私钥 (保密!):", wallet.privateKey);
console.log("\n助记词 (备份!):");
console.log(wallet.mnemonic.phrase);
console.log("\n" + "=".repeat(60));
console.log("⚠️  请将私钥（不含 0x）复制到 .env 文件中");
console.log("⚠️  这个钱包仅用于测试，请勿存放真实资产！");
console.log("=".repeat(60));
