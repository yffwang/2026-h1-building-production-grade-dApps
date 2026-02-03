const { ethers } = require("ethers");

async function main() {
    // Moonbase Alpha RPC 地址
    const RPC_URL = "https://rpc.api.moonbase.moonbeam.network";
    // 你刚才 status: 1 成功的那个 Proxy 地址
    const PROXY_ADDRESS = "0x81f846C663Dc94cA5E6e4b57Cf5A9178a00ADF5B";

    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // 定义 ABI：我们只需要验证 version 和 totalSales
    const abi = [
        "function version() view returns (uint256)",
        "function totalSales() view returns (uint256)"
    ];

    const vault = new ethers.Contract(PROXY_ADDRESS, abi, provider);

    console.log("\n==============================================");
    console.log("正在连接 Moonbase Alpha 验证「褶式金库协议」...");
    console.log("==============================================\n");

    try {
        // 1. 验证版本号（这是 V2 新增/修改的逻辑）
        const version = await vault.version();
        console.log(`[逻辑验证] 当前合约版本: ${version.toString()}`);

        // 2. 验证存储状态（这是 V1 初始化并保留下来的数据）
        const sales = await vault.totalSales();
        console.log(`[数据验证] NFT 累计销量: ${sales.toString()}`);

        console.log("\n----------------------------------------------");
        if (version.toString() === "2" && sales.toString() === "100") {
            console.log("✅ 验证通过：协议已成功进化至 2.0，且历史销量数据完好！");
            console.log("这证明你的代付 gas 服务费没有白收，存储槽逻辑完全正确。");
        } else {
            console.log("❌ 验证未完全通过，请检查逻辑合约地址。");
        }
        console.log("----------------------------------------------\n");

    } catch (error) {
        console.error("验证过程中发生错误，可能是合约尚未同步或地址有误:", error.message);
    }
}

main();
