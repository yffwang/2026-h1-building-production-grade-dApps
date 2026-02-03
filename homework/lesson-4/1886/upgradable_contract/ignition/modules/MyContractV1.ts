// ignition/modules/MyContractV1.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Ignition 模块：部署 MyContractV1 UUPS 代理
 *
 * 这个模块会部署：
 * 1. MyContractV1 实现合约
 * 2. ERC1967Proxy 代理合约
 * 3. 通过代理调用 initialize()
 */
const MyContractV1Module = buildModule("MyContractV1Module", (m) => {
  // 可选参数
  const initialOwner = m.getParameter("initialOwner", m.getAccount(0));

  // 1. 部署实现合约
  const implementation = m.contract("MyContractV1", [], {
    id: "MyContractV1_Implementation",
  });

  // 2. 编码初始化调用数据
  // initialize() 函数没有参数
  const initializeData = m.encodeFunctionCall(implementation, "initialize", []);

  // 3. 部署 ERC1967Proxy
  const proxy = m.contract("ERC1967Proxy", [implementation, initializeData], {
    id: "MyContractV1_Proxy",
  });

  // 4. 创建代理合约的接口实例（用于后续调用）
  const proxyAsContract = m.contractAt("MyContractV1", proxy, {
    id: "MyContractV1_ProxyInterface",
  });

  // 返回部署结果
  return {
    implementation,
    proxy,
    proxyAsContract,
  };
});

export default MyContractV1Module;
