// scripts/verify.ts
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const network = await ethers.provider.getNetwork();
  console.log("🌐 网络:", network.name, "(Chain ID:", network.chainId, ")\n");

  // Gas 配置
  const gasConfig = {
    maxFeePerGas: ethers.parseUnits("2000000000", "gwei"),
    maxPriorityFeePerGas: ethers.parseUnits("2000000000", "gwei"),
  };

  // 从 Ignition 部署文件读取地址
  const deploymentPath = path.join(
    __dirname,
    "..",
    "ignition",
    "deployments",
    `chain-${network.chainId}`,
    "deployed_addresses.json",
  );

  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`未找到部署文件:  ${deploymentPath}\n请先运行部署命令`);
  }

  const deployedAddresses = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  // 根据部署的模块获取地址
  const proxyAddress =
    deployedAddresses["UpgradeToV2Module#MyContractV2_ProxyInterface"] ||
    deployedAddresses["MyContractV1Module#MyContractV1_Proxy"];

  const implementationV2Address =
    deployedAddresses["UpgradeToV2Module#MyContractV2_Implementation"];

  const implementationV1Address =
    deployedAddresses["MyContractV1Module#MyContractV1_Implementation"];

  console.log("📋 部署信息:");
  console.log("=====================================");
  console.log("代理地址:", proxyAddress);
  console.log("V1 实现:", implementationV1Address);
  console.log("V2 实现:", implementationV2Address || "(未升级)");
  console.log("=====================================\n");

  // 连接到合约
  let contract;
  try {
    contract = await ethers.getContractAt("MyContractV2", proxyAddress);
  } catch (error) {
    console.log("⚠️  尝试连接 V1 合约...");
    contract = await ethers.getContractAt("MyContractV1", proxyAddress);
  }

  // 读取状态
  console.log("📊 当前合约状态:");
  console.log("-------------------------------------");

  const version = await contract.version();
  console.log("✓ 版本号:", version.toString());

  const myValue = await contract.myValue();
  console.log("✓ myValue:", myValue.toString());

  // 检查是否为 V2
  try {
    const contractV2 = contract as any;
    const counter = await contractV2.counter();
    console.log("✓ counter:", counter.toString());

    const [signer] = await ethers.getSigners();
    const userStats = await contractV2.getUserStats(signer.address);
    console.log("✓ 用户调用次数:", userStats.toString());
    console.log("\n🎉 当前版本:  V2");
  } catch (error) {
    console.log("\n📌 当前版本: V1");
  }

  console.log("-------------------------------------");

  // 测试交互
  console.log("\n🧪 测试合约交互.. .\n");

  // 设置值
  console.log("1️⃣ 设置 myValue = 888.. .");
  const tx1 = await contract.setValue(888, gasConfig);
  const receipt1 = await tx1.wait();
  console.log("   ✓ 交易哈希:", tx1.hash);
  console.log("   ✓ Gas 使用:", receipt1?.gasUsed.toString());
  console.log("   ✓ 新值:", (await contract.myValue()).toString());

  // 设置消息
  console.log("\n2️⃣ 设置消息...");
  const tx2 = await contract.setMessage("Hello UUPS on Polkadot!", gasConfig);
  const receipt2 = await tx2.wait();
  console.log("   ✓ 交易哈希:", tx2.hash);
  console.log("   ✓ Gas 使用:", receipt2?.gasUsed.toString());
  console.log("   ✓ 消息:", await contract.getMyMessage());

  // 如果是 V2，测试新功能
  try {
    const contractV2 = contract as any;
    console.log("\n3️⃣ 测试 V2 功能 - 批量设置值...");
    const tx3 = await contractV2.setValueBatch([100, 200, 300], gasConfig);
    const receipt3 = await tx3.wait();
    console.log("   ✓ 交易哈希:", tx3.hash);
    console.log("   ✓ Gas 使用:", receipt3?.gasUsed.toString());
    console.log("   ✓ 求和结果:", (await contract.myValue()).toString());

    console.log("\n4️⃣ 测试 V2 功能 - 增加计数器.. .");
    const tx4 = await contractV2.incrementCounter(gasConfig);
    const receipt4 = await tx4.wait();
    console.log("   ✓ 交易哈希:", tx4.hash);
    console.log("   ✓ Gas 使用:", receipt4?.gasUsed.toString());
    console.log("   ✓ 计数器:", (await contractV2.counter()).toString());
  } catch (error) {
    console.log("\n⚠️  V2 功能不可用（当前为 V1）");
  }

  // 最终状态
  console.log("\n📊 最终状态摘要:");
  console.log("=====================================");
  console.log("版本:", (await contract.version()).toString());
  console.log("myValue:", (await contract.myValue()).toString());

  try {
    const contractV2 = contract as any;
    console.log("counter:", (await contractV2.counter()).toString());
    const [signer] = await ethers.getSigners();
    console.log(
      "调用次数:",
      (await contractV2.getUserStats(signer.address)).toString(),
    );
  } catch (error) {
    console.log("(V2 功能未启用)");
  }

  console.log("=====================================");
  console.log("\n✅ 验证完成!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 错误:", error);
    process.exit(1);
  });
