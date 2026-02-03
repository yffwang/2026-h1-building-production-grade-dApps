// ignition/modules/upgrade.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import MyContractV1Module from "./MyContractV1";

/**
 * Ignition 模块：升级到 MyContractV2
 *
 * 这个模块会：
 * 1. 部署新的 MyContractV2 实现合约
 * 2. 通过代理调用 upgradeToAndCall() 升级
 * 3. 调用 initializeV2() 初始化新状态
 */
const UpgradeToV2Module = buildModule("UpgradeToV2Module", (m) => {
  // 1. 引用之前部署的代理合约
  const { proxyAsContract: proxyV1 } = m.useModule(MyContractV1Module);

  // 2. 部署新的实现合约 V2
  const implementationV2 = m.contract("MyContractV2", [], {
    id: "MyContractV2_Implementation",
  });

  // 3. 编码 V2 初始化调用数据
  const initializeV2Data = m.encodeFunctionCall(
    implementationV2,
    "initializeV2",
    [],
  );

  // 4. 调用升级函数（通过 V1 代理接口）
  // 注意：这里使用 upgradeToAndCall 一步完成升级和初始化
  m.call(proxyV1, "upgradeToAndCall", [implementationV2, initializeV2Data], {
    id: "UpgradeToV2_Call",
  });

  // 5. 获取升级后的代理接口（V2）
  const proxyAsV2 = m.contractAt("MyContractV2", proxyV1, {
    id: "MyContractV2_ProxyInterface",
  });

  return {
    implementationV2,
    proxyAsV2,
    proxyAddress: proxyV1, // 代理地址保持不变
  };
});

export default UpgradeToV2Module;
